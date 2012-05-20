#!/usr/bin/python

import os, random, string

relative_links = []
relative_count = 0

def link(url, info):
    return '<a href="'+url+'">link to ['+url+'] in [ '+info+' ]</a>.<br>\n';

def generate_htmls(destdir, subfiles):
    heregen = []
    os.mkdir(destdir)
    for fil in xrange(1, subfiles):
        filename = destdir + 'page-' + str(fil) + '.html'
        singlef = open(filename, 'w+')

        # some link are present always, and are really useful for a plausible path
        singlef.write(link('../index.html', str(subfiles) ))

        # absolute and relative
        singlef.write(link('index.html', str(len(heregen)) ))
        singlef.write(link('reallist.html', str(len(heregen)) ))
        singlef.write(link('fakelist.html', str(len(heregen)) ))
        singlef.write('<a href="http://www.delirandom.net/">arbitrary external</a>.<br>\n');

        # fill the links inside 'filename' pointing to some local links
        for xx in xrange(2, random.randint(4, subfiles)):
            if xx != fil:
                singlef.write(link('page-' + str(xx) + '.html', destdir))
        
        singlef.close()
        heregen += [filename]

    # random recursion happen! 
    if random.randint(3,7) == 5:
        randindex = random.randint(10,99)
        rrpath = destdir + 'rec-' + str(randindex) +'/'
        heregen += generate_htmls(rrpath, random.randint(5, 40))
        heregen += [ rrpath + 'index.html' ]
        # recursion is excluded from the index, so call it specifically
        recindex = open(rrpath + 'index.html', 'w+')
        recindex.write(link('page-1.html', 'arbitraly set'))
        recindex.write(link('page-2.html', 'arbitraly set'))
        recindex.write(link('page-3.html', 'arbitraly set'))
        recindex.write(link('page-4.html', 'arbitraly set'))
        recindex.close()

    return heregen

def write_subdir_list(destname, source_array, number_elem):
    destfile = open(destname, 'w+')

    # all the link here are with the "../" and full path
    for somelink in random.sample(source_array, number_elem):
        destfile.write(link('../' + somelink, 'subdir_addings'))
    destfile.close()

# XXX XXX XXX XXX
used_index = 'index.html'
u_i_f = open(used_index, 'w+')

# here start the main loop
for i in xrange(1,5):
    dirname = 'subdir-' + str(i) + '/'

    relative_links += generate_htmls(dirname, 6)
    write_subdir_list(dirname + 'index.html', relative_links, 5)

    u_i_f.write(link(dirname + 'index.html', dirname))

# put some non existend link
for i in xrange(1,5):
    dirname = 'subdir-' + str(i) + '/'
    listname = dirname + 'fakelist.html'
    relative_links += [listname]
    write_subdir_list(listname, [ 'wrn1', 'wrn2', 'wrn3', 'wrn4', 'wrn5', 'subdir-' + str(i) + '/reallist.html'], 5);

    u_i_f.write(link(dirname + 'index.html', dirname))

# a link able to point in every other section
for i in xrange(1,5):
    dirname = 'subdir-' + str(i) + '/'
    listname = dirname + 'reallist.html'
    write_subdir_list(listname, relative_links, 5);

    u_i_f.write(link(dirname + 'index.html', dirname))

u_i_f.close()

total_index = 'mainindex.html'
t_i_f = open(total_index, 'w+')
for single_link in relative_links:
    t_i_f.write(link(single_link, 'rootdir'))
t_i_f.close()
