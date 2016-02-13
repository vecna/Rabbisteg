#!/usr/bin/env python
# -*- encoding: utf-8 -*-


from lib.requestor import Requestor
from lib.rabbiblocks import Rabbiblocks
import sys
import time
import pprint

def handShake(url, password):
    handShakeRounds = 4

    for i in xrange(handShakeRounds):
        url = Rabbiblocks.handShakeNext if Rabbiblocks.handShakeNext else url
        r = Requestor(url)
        r.browserLikeBehavior()

        while r.isNotAvailable(None):
            print "Not yet!"
            time.sleep(100)
            continue

        newBlock = r.linkStructure(url)
        Rabbiblocks.addBlock(newBlock)
        Rabbiblocks.handShakeStep(password)


def transmission(message, password):
    pass

if __name__ == "__main__":

    pprint.pprint(sys.argv)
    handShake('http://www.carmillaonline.com', 'password')




