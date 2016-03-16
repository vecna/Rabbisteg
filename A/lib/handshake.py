#!/usr/bin/env python
# -*- encoding: utf-8 -*-

from lib.requestor import Requestor
from lib.rabbiblocks import Blocks
import sys
import time
import pprint

def handShake(url, password):
    handShakeRounds = 4

    Blocks.initStatus(url)

    for i in xrange(handShakeRounds):
        url = Blocks.handShakeNext() if Blocks.handShakeNext() else url
        r = Requestor(url)
        r.browserLikeBehavior()

        while r.isNotAvailable(None):
            print "Not yet!"
            time.sleep(100)
            continue

        newBlock = r.linkStructure(url)
        Blocks.addBlock(newBlock)
        Blocks.handShakeStep(password)

