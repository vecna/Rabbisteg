# -*- encoding: utf-8 -*-
"""
Library containing utilities for Requestor class
"""

import threading
import urllib
import pdb, pprint


def do_request(url):
    pdb.set_trace()
    a = urllib.request.Request(
        url,
        data=None,
        headers={
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.47 Safari/537.36'
        }
    )
    pdb.set_trace()
    pprint.pprint(a)


def fetch(url, options={}):

    MultithreadFetcher(url).start()



class MultithreadFetcher(threading.Thread):

    def __init__(self, url):
        self.url = url

        threading.Thread.__init__(self)

    def run(self):

        do_request(self.url)


