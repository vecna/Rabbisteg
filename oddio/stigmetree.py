from twisted.internet import reactor
from twisted.web.client import getPage

# http://www.boddie.org.uk/python/HTML.html
from HTMLParser import HTMLParser
import urlparse

"""
Utilities: urlkey
           unique (Allen, stackoverflow)
"""
def urlkey(referer, url):
    return referer + "+" + url

def unique(items):
    seen = set()
    for i in xrange(len(items)-1, -1, -1):
        it = items[i]
        if it in seen:
            del items[i]
        else:
           seen.add(it)

"""
create a subclass of HTMLParser and override/create some methods,
this permit to get a list of uniq absolute URL included in the 
parsed page
"""
class MyHTMLParser(HTMLParser):

    parsedurls = []
    pagebase = ''

    def handle_starttag(self, tag, attrs):
        if tag == 'a':
            href = [v for k, v in attrs if k=='href']
            if href:
                self.parsedurls.extend(href)

        if tag == 'base':
            self.pagebase = attrs['href']


    def cleanparsed(self, sourceurl):
        sourceurl = sourceurl + "/"
        unique(self.parsedurls)
        for i, unclean in enumerate(self.parsedurls):
            self.parsedurls[i] = urlparse.urljoin(sourceurl, unclean)

        unique(self.parsedurls)

    def close(self):
        HTMLParser.close(self)
        parsedurls = []


"""
alls is storing a dict, every possibile referer is a key, and then is verified
if a page has been already fetched or not.
"""
alls = {}

class pageLinks:
    """
    This class keep track of the reference between
    a single page and their links
    """

    def __init__(self, referer, links):
        self.refered = referer
        # todo - clean incoming links
        self.links = links

    def get_first_unfetch(self):

        for mylinked in self.links:

            if len(mylinked) < 40:
                continue

            if alls.has_key(mylinked):
                continue
            else:
                return mylinked


def collector(referer, url, pagecontent):
    """
    This is the main function called after the getPage cb
    """
    (links, base) = extractor(url, pagecontent)
    newPl = pageLinks(base, links)
    alls.update({base : newPl })
    return newPl.get_first_unfetch()

def extractor(url, pagecontent):

    parser = MyHTMLParser()
    parser.feed(pagecontent)
    parser.cleanparsed(url)
    retblock = (parser.parsedurls, parser.pagebase)
    parser.close()

    return retblock


"""
Twisted callbacks
"""
def ok(res, url, myshit):
    next = collector(myshit, url, res)
    reactor.callLater(2, load, next)

def error(res, url, myshit):
    reactor.callLater(30, load, url)

def load(url):
    d = getPage(url,
                headers={"Accept": "text/html"},
                timeout=5)
    d.addCallback(ok, url, "shit")
    d.addErrback(error, url, "shit")


if __name__ == '__main__':
    import sys
    if len(sys.argv) > 1:
        starturl = sys.argv[1]
    else:
        starturl = 'http://www.delirandom.net/'

    load(starturl)
    reactor.run()
