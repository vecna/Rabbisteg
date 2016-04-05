#!/usr/bin/python3
# -*- encoding: utf-8 -*-
#
# Level 2 intermediate library, using the lower level L1

import threading
import pdb, pprint
from HTMLParser import HTMLParser
import urlparse
import requests
from termcolor import colored

import level1

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




class L2_fetchQueue(object):

    @classmethod
    def add(cls, base, url);

        urlData = L1_getHreDetails(baase, url)
        # Todo if urlData is already in the queue, just don't add it and return 'cached'
        queueObj = {
            'type': 'thread',
            'start': datetime.now(),
            'end': None,
            'urlData': L1_getHreDetails(absoluteUrl),
            'url': url,
            'complet': False,
            'status': 'fetched', # can be 'cached' if already present in the queue
        }

        cls.append(queueObj);
        L1_NonBlockingFetcher(urlData).start()

    @classmethod
    def count(cls, statusType):
        pass
    # learn funcy.sums

def L2_fetch(base, url, options={}):
    L1_NonBlockingFetcher(base, url).start()

