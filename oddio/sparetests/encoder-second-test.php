<?php
/* the encoder need to be written in js, but before I want study the logic,
 * question ? https://github.com/vecna/stegoclick
 * http://www.delirandom.net/stegoclick (entire project)
 * http://www.delirandom.net/oddio (encoding library, studies, etc)
 */

/* get_links(), @author Jay Gilford */
function get_links($url) {

    // Create a new DOM Document to hold our webpage structure
    $xml = new DOMDocument();
    $xml->strictErrorChecking = false;
 
    // Load the url's contents into the DOM
    $xml->loadHTMLFile($url);
 
    // Empty array to hold all links to return
    $links = array();
 
    //Loop through each <a> tag in the dom and add it to the link array
    foreach($xml->getElementsByTagName('a') as $link) {
        /* $links[] = array('url' => $link->getAttribute('href'), 'text' => $link->nodeValue); */
        $links[] = $link->getAttribute('href');
    }
 
    //Return the links
    return $links;
}

/* rel2abs(), @author nashruddin.com */
function rel2abs($rel, $base)
{
    /* return if already absolute URL */
    if (parse_url($rel, PHP_URL_SCHEME) != '') return $rel;

    /* queries and anchors */
    if ($rel[0]=='#' || $rel[0]=='?') return $base.$rel;

    /* parse base URL and convert to local variables:
     $scheme, $host, $port, $path */
    extract(parse_url($base));

    /* remove non-directory element from path */
    $path = preg_replace('#/[^/]*$#', '', $path);

    /* destroy path if relative url points to root */
    if ($rel[0] == '/') $path = '';

    /* dirty absolute URL */
    if(isset($port)) 
        $abs = "$host:$port$path/$rel";
    else
        $abs = "$host$path/$rel";

    /* replace '//' or '/./' or '/foo/../' with '/' */
    $re = array('#(/\.?/)#', '#/(?!\.\.)[^/]+/\.\./#');
    for($n=1; $n>0; $abs=preg_replace($re, '/', $abs, -1, $n)) {}

    /* absolute URL is ready! */
    return $scheme.'://'.$abs;
}

function strip_from_base($link, $base, $permit_external) 
{

    if(strstr($link, $base)) {
        $base_strip = substr($link, strlen($base));
    }

    if(strstr($link, 'http://') || strstr($link, 'https://')) {
        if(!isset($base_strip)) {
            return !$permit_external;
        }
    }

    if(isset($base_strip)) {
        return $base_strip;
    }

    return $link;
}

function new_http_req($link_url) {
    $retrivered = get_links($link_url);
    print "requested = ".$link_url." return ".count($retrivered)." elements\n";
    return $retrivered;
}

/* every link is a node */
class oddio_node 
{
    public $my_value;
    public $my_link;
    public $referer;

    public $linked_elements;

    public $linked = array();

    public $next_node;

    function oddio_node($referer, $link) {
        $this->my_link = $link;
        $this->referer = $referer;
        print "creato  l($this->my_link) -  r($this->referer)\n";
    }

    function info() {
        return "r($this->referer) l($this->my_link) v$this->my_value #'s".count($this->linked)." #'.s$this->linked_elements ";
    }

    function append_leaf($node) 
    {
        $linked[] += $node;

        print $this->info()." append ".$node->info()."\n";
    }

    function has_link($url) {
        print "has_url $url - $this->my_link ?\n";
        return ($url == $this->my_link);
    }
};

class oddio
{
    private $first_line_nodes = array();
    private $first_line_elements = 0;
    private $first_line_referer;

    /* used for the first entry point referer */
    function append_node_list($urls, $referer)
    {
        if(isset($this->first_line_referer)) 
        {
            if($this->first_line_referer != $referer) {
                print "error in usage 'oddio': $referer called as first line";
                print " the first line is $this->first_line_referer\n";
                exit;
            }
        } else {
            $this->first_line_referer = $referer;
            print "set as first line referer $referer\n";
        }

        $previous_obj; $inuse_obj; foreach ($urls as $url) 
        {
            $inuse_obj = new oddio_node($referer, $url);
            array_push($this->first_line_nodes, $inuse_obj);
            $inuse_obj->my_value = $this->first_line_elements;

            if(isset($previous_obj))
                $previous_obj->next_node = $inuse_obj;

            $previous_obj = $inuse_obj;

            $this->first_line_elements++;

            print "1st append_node_list: ".$inuse_obj->info()."\n";
        }
    }

    /* used for the second link layer and so on ... */
    function expand_node_list($referer, $urls)
    {
        print "expand 2nd and more: referer $referer urls ";
        print_r($urls);
        $target_node = $this->get_node_by_link($referer); // TODO: serve tracciare la sequenza di referer!
        $start_value = $target_node->my_value;
        $count_value = 0;

        $previous_obj; $inuse_obj; foreach ($urls as $url) 
        {
            $inuse_obj = new oddio_node($referer, $url);
            $inuse_obj->my_value = $start_value + $count_value;

            $target_node->append_leaf($inuse_obj);

            if(isset($previous_obj))
                $previous_obj->next_node = $inuse_obj;

            $previous_obj = $inuse_obj;
            $count_value++;
        }

        $url_number = count($urls);
        print "verifica $url_number -- $count_value --\n";

        /* need to be updated the my_value following */
        while (1) {
            $target_node->my_value += $count_value;

            if(isset($target_node->next_node)) {
                print " passo da $target_node->my_value $target_node->my_link a ...";
                $target_node = $target_node->next_node;
                print " ... $target_node->my_value $target_node->my_link \n";
            }
            else {
                print " $target_node->my_value $target_node->my_link ULTIM!\n";
                break;
            }
        }

        /* end */
    }

    function get_node_by_link($url) 
    {
        foreach ($this->first_line_nodes as $node) 
        {
            if($node->has_link($url)) {
                print "matcha $node->my_link + $url\n";
                return $node;
            }
        }
        print "node not found $url! argh!! \n";
    }

    /* simple does not print, auto_info does */
    function simple_info() {
        return "seqlist $this->first_line_elements r$this->first_line_referer eff# ".count($this->first_line_nodes);
    }

    function auto_info() 
    {
        print $this->simple_info()."\n";
        // print_r($this->first_line_nodes);
        foreach($this->first_line_nodes as $single_node) 
        {
            print $single_node->info()."\n";
        }
    }
};

    /* * * *                                  * * * * *
     *                  HERE START                    *
     * * * *                                  * * * * */

$base_index = 'http://127.0.0.1:8080/oddio/index.html';

$starting_block = get_links($base_index);

$relative_base = substr($base_index, 0, 
                        strlen($base_index) - strlen(strrchr($base_index, '/'))
                    ).'/';

/*
$linktable = new oddio_primotest();
$linktable->set_http_base($relative_base);
$linktable->add_links($starting_block, $base_index);

while($i) {
    $linktable->few_infos();
    $new = $linktable->get_random_link();
    $linktable->add_links(new_http_req($new), $new);

    $i--;
}

$linktable->lot_infos();
*/

$nuovoddio = new oddio($relative_base, $starting_block);
$nuovoddio->append_node_list($starting_block, $relative_base);
print $nuovoddio->auto_info()."\n";

foreach($nuovoddio as $poa) {
    print $poa->info()."\n";
}

$link_used = 'subdir-2/index.html';
$test = $nuovoddio->get_node_by_link($link_used);

$new_link = 'subdir-5/index.html';
$last_link_block = new_http_req($new_link);

$nuovoddio->expand_node_list($new_link, $last_link_block);

?>
