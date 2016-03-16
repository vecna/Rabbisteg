# -*- encoding: utf-8 -*-
"""
Library containing utilities for Requestor class
"""

import threading
import pdb, pprint
from HTMLParser import HTMLParser
import urlparse
import requests

def unique(items):
    seen = set()
    for i in xrange(len(items)-1, -1, -1):
        it = items[i]
        if it in seen:
            del items[i]
        else:
           seen.add(it)

class HrefParser(HTMLParser):

    def handle_starttag(self, tag, attrs):
        if not hasattr(self, 'parsedurls'):
            self.pagebase = ''
            self.parsedurls = []

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


class InclusionParser(HTMLParser):

    def handle_starttag(self, tag, attrs):
        if not hasattr(self, 'parsedurls'):
            self.pagebase = ''
            self.parsedurls = []

        print "INcusion", tag, "+", attrs
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


####

def do_request(url):
    a = requests.get(url)
    pprint.pprint(a)
    pdb.set_trace()
    return a


def fetch(url, options={}):
    print "fetch", url
    MultithreadFetcher(url).start()


class MultithreadFetcher(threading.Thread):

    def __init__(self, url):
        self.url = url
        print "costrutt"
        threading.Thread.__init__(self)

    def run(self):

        print "do_re"
        self.response = do_request(self.url)

        parser = HrefParser()
        parser.feed(self.response)
        parser.cleanparsed(self.url)
        retblock = (parser.parsedurls, parser.pagebase)
        parser.close()

        pprint.pprint(retblock)


