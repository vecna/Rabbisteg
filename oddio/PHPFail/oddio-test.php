<?php

include 'oddio-singleton.php';
include 'oddio-nodes.php';

/* the encoder need to be written in js, but before I want study the logic,
 * question ? https://github.com/vecna/stegoclick
 * http://www.delirandom.net/stegoclick (entire project)
 * http://www.delirandom.net/oddio (encoding library, studies, etc)
 */

$logdir = 'incremental_log/';
// log::log_setup( array('table', 'nodeobj', 'error'));
// log::log_setup( array('table', 'error'));
// log::log_setup( array('all'), array('recursion', 'table'), $logdir);
log::log_setup( array('fetch', 'nodeobj', 'error', 'table'), array('recursion', 'retrivered-table'), $logdir);

$base_index = 'http://127.0.0.1:8080/oddio/index.html';


$relative_base = substr($base_index, 0, 
                        strlen($base_index) - strlen(strrchr($base_index, '/'))
                    ).'/';

$unclean_starting_block = get_links($base_index);
$oddio_singlt = new oddio();
$starting_block = $oddio_singlt->clean_retrivered($base_index, $unclean_starting_block);
$oddio_singlt->align_fetching($base_index, $starting_block);

$oddio_singlt->oddio_start($relative_base, $starting_block);

while(true) 
{
    log::$action_id++;

    $oddio_singlt->incremental_nodes_dump(log::$action_id);

    $url = $oddio_singlt->get_first_unfetched();
    required_data($url, "ACQUIRING COMPLETE\n");

    /* fetch and clean the links: absolute link only, coherent with relative_base, non dup */
    $urls_in_page = $oddio_singlt->clean_retrivered($url, get_links($url));

    /* in the list of retrived link, mark the fetched and add the other, if newer */
    $oddio_singlt->align_fetching($url, $urls_in_page);

    /* get the list of the node (every node is an uniq refer+link combo) with a child like $url */
    $child_to_update = $oddio_singlt->get_node_by_child($url);
    required_data($child_to_update, "ERROR in (".$url.")\n");

    /* append to every node the expected link, add too in oddio::urlobj_table */
    $oddio_singlt->urlobj_table_updater($child_to_update, $url, $urls_in_page);

    /* check che tutto sia allineato or what ? */
}

function required_data($toCheck, $errorMsg) 
{
    if(isset($toCheck))
        return;

    print $errorMsg;
    exit;
}

?>
