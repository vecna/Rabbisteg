# -*- encoding: utf-8 -*-
"""
Library containing utilities for Requestor class
"""

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


####

def do_request(url):
    try:
        a = requests.get(url)
    except EX:
        print "pushd ../caspercode/fakeweb/"
        print "python -m SimpleHTTPServer"
        raise EX
    print "Content-Type:", a.headers['content-type']
    return a.text

def fetch(url, options={}):
    print "fetch", url
    MultithreadFetcher(url).start()

def parse_response(html, url):

    parser = HrefParser()
    parser.feed(html)
    parser.cleanparsed(url)
    retval = (parser.parsedurls, parser.pagebase)
    parser.close()
    return retval

class MultithreadFetcher(threading.Thread):

    def __init__(self, url):
        self.url = url
        print "Thread contructor"
        threading.Thread.__init__(self)

    def run(self):
        print "do_re"
        self.response = do_request(self.url)

        retblock = parse_response(self.response)

        debug("And the retblock is", pprint.pprint, retblock)
