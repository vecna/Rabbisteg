# -*- encoding: utf-8 -*-
#!/usr/bin/env python

class Blocks(object):

    status = []
    statusPointer = 0
    __tmp = None

    @classmethod
    def addBlock(cls, newBlock):
        for e in newBlock:
            Blocks.status.append(e)


    @classmethod
    def handShakeNext(cls):
        if not len(Blocks.status):
            return Blocks.__tmp
        else:
            print "__ Still TBI"
            return "http://www.google.com"


    @classmethod
    def initStatus(cls, url):
        Blocks.__tmp = url
