#!/usr/bin/env python
# -*- encoding: utf-8 -*-

import os
import sys

this_directory = os.path.dirname(__file__)
root = os.path.abspath(os.path.join(this_directory, '..'))
sys.path.insert(0, root)

from lib.requestor import Requestor

r = Requestor('http://localhost:8000')
r.browserLikeBehavior()

