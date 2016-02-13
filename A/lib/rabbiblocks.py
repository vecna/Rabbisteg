# -*- encoding: utf-8 -*-
#!/usr/bin/env python

class Rabbiblocks(object):

    status = []

    @classmethod
    def addBlock(cls, newBlock):
        for e in newBlock:
            Rabbiblocks.status.append(e)


    @classmethod
    def handShakeNext(cls):
        pass
