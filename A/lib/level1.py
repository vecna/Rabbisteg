#!/usr/bin/python3
# -*- encoding: utf-8 -*-
#
# Llow level utilities are here

import threading
import pdb, pprint
from HTMLParser import HTMLParser
import urlparse
import requests
from termcolor import colored

def debug(text, funct, argument):
    print colored(text, "red")
    funct(argument)

def unique(items):
    seen = set()
    for i in xrange(len(items)-1, -1, -1):
        it = items[i]
        if it in seen:
            del items[i]
        else:
           seen.add(it)


class L1_hrefParser(HTMLParser):

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

    @classmethod
    def perform(cls, html, url):

        retDict = {
            'type': 'parse',
            'start': datetime.now(),
            'end': None,
            'url': url,
            'htmlSize': len(html),
            'parsedUrls': [],
            'base': None,
            'success': False,
        }

        parser = cls()
        parser.feed(html)
        parser.cleanparsed(url)

        retDict['parsedUrls'] = parser.parsedurls
        retDict['base'] = parser.pagebase
        retDict['end'] = datetime.now()

        parser.close()

        return retDict 


class InclusionParser(HTMLParser):

    def handle_starttag(self, tag, attrs):
        if not hasattr(self, 'parsedurls'):
            self.pagebase = ''
            self.parsedurls = []

        print "Inclusion", tag, "+", attrs
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


class L1_NonBlockingFetcher(threading.Thread):

    def __init__(self, url):
        self.url = url 
        threading.Thread.__init__(self)
        
    def run(self):
        self.response = L1_doRequest(self.url)
        retblock = parse_response(self.response)
        debug("And the retblock is", pprint.pprint, retblock)


def L1_getHrefDetails(base, url):
    # get absoluteUrl, strip parameters or not, based on options, make an hash
    fullUrl = base + url
    return {
        'hash': 'TODO+' + fullUrl,
        'absoluteUrl': fullUrl
    }

def L1_doRequest(url):

    retDict = {
        'acquired': False,
        'type': 'request',
        'start': datetime.now(),
        'end': None,
        'url': url,
        'text': None,
        'error': None,
        'success': False,
        'contentType': None
    }

    try:
        result = requests.get(url)
    except EX:
        print "pushd ../caspercode/fakeweb/"
        print "python -m SimpleHTTPServer"
        raise EX

    retDict['contentType'] = result.headers['content-type']
    retDict['text'] = a.text
    retDict['end'] = datetime.now()
    return retDict


if __name__ == '__main__':
    print("Testing function in level1 library")

    L1_doRequest()
    L1_getHrefDetails()
    L1_hrefParser()
    L1_NonBlockingFetcher()
