#!/usr/bin/env python
# -*- encoding: utf-8 -*-

import os
import sys

this_directory = os.path.dirname(__file__)
root = os.path.abspath(os.path.join(this_directory, '..'))
sys.path.insert(0, root)

from lib.requestorutils import unique, do_request, fetch, parse_response

a = do_request('http://www.ilpost.it')
print a
