#!/usr/bin/env python
"""
Goals of Class requestor:

    1) specify an URL
    2) perform the first basic normal HTTP connectio
    3) parse <script> and other included element retrieved from the page
    4) execute immediatly such downloads, because that is how a browser behave.
        (at least, a browser without javascript)

Everthing is non-blocking
"""
# -*- encoding: utf-8 -*-

import requestorutils

_headers={
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.47 Safari/537.36'
}


class Requestor(object):

    def __init__(self, url):
        self.url = url
        self.headers = _headers

    def browserLikeBehavior(self):
        self.keepInMemory(requestorutils.fetch(self.url))
        pass

    def isNotAvailable(self, dumpInfo):
        return True

    def linkStructure(self):
        pass

    def keepInMemory(self, stuff):
        pass

"""
req = urllib.request.Request(
    url,
    data=None,
    headers={
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.47 Safari/537.36'
    }
)

f = urllib.request.urlopen(req)
print(f.read().decode('utf-8'))
"""
