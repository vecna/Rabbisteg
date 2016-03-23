#!/usr/bin/env python
# -*- encoding: utf-8 -*-

from lib.requestor import Requestor
from lib.rabbiblocks import Blocks
from lib.handshake import handShake
import sys
import time
import pprint


def transmission(message, password):
    pass

if __name__ == "__main__":

    pprint.pprint(sys.argv)
    handShake('http://localhost:8000', 'password')




