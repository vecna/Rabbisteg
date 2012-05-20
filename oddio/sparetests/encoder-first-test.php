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
    }

    function append_leaf($node) {
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
            $this->first_line_nodes[] += $inuse_obj;
            $inuse_obj->my_value = $this->first_line_elements;

            if(isset($previous_obj))
                $previous_obj->next_node = $inuse_obj;

            $previous_obj = $inuse_obj;

            $this->first_line_elements += 1;
        }
    }

    /* used for the second link layer and so on ... */
    function expand_node_list($urls, $referer)
    {
        $target_node = get_node_by_link($referer); // TODO: serve tracciare la sequenza di referer!
        $start_value = $target_node->my_value;
        $count_value = 0;

        $previous_obj; $inuse_obj; foreach ($urls as $url) 
        {
            $inuse_obj = new oddio_node($referer, $url);
            $inuse_obj->my_value = $start_value + $count_value;

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
            print "$node->my_link e $url\n";
            if($node->my_link == $url) 
            {
                return $node;
            }
        }
    }
};

class oddio_primotest
{
    // struct of '$table': Array(referer1 => (link1, link2) , referer2 => (linkX, linkK))
    private $table; 
    // struct of  '$reftable': Array( referer1 => #elem group 1, referer2 => #elem group 2)
    private $reftable;
    // sum of the elements indexed in '$table'
    private $urlcount = 0;
    // different way to keep track of the url list */
    private $sequenced_table = array();

    private $relative_base;
    private $buffer_toencode;

    function add_links($urls, $referer) 
    {
        /* referer need to be stripped of the base */
        $cleanref = strip_from_base($referer, $this->relative_base, false);

        if(isset($this->reftable[$cleanref])) {
            print "[-] already set referer: $cleanref\n";
            return;
        }
        else
        {
            $this->reftable[$cleanref] = count($urls);
            $this->urlcount += count($urls);
        }

        foreach ($urls as $url) 
        {
            $cleanurl = strip_from_base($url, $this->relative_base, true);

            if($cleanurl == false) 
                continue;

            if(!isset($this->table[$cleanref][$cleanurl])) {
                $this->table[$cleanref][$cleanurl] = 123;
            }

            array_push($this->sequenced_table, $cleanref.':'.$cleanurl);
        }

        print "info, tracked count $this->urlcount array tracking ".count($this->sequenced_table)."\n";
    }

    function single_remove($urls, $referer) {
    }

    /* not yet used */
    function set_encoding_buffer($data) {
        $this->buffer_toencode = $data;
    }
    /* yep, this is used in testing */
    function get_random_link() 
    {
        $choosen = rand(0, $this->urlcount -1);

        /* the base url had a dynamic numer of ":" */
        // $selected = split(':', substr($this->sequenced_table[$choosen], strlen($this->relative_base)));
        $selected = split(':', $this->sequenced_table[$choosen]);
        /* selected has refered [0] link [0] */

        $relative_link = array_pop($selected);

        /* if the referer contain a directory, in inhereit in the relative link */
        if(strpos($selected[0], '/')) {
            $pathsplit = split('/', $selected[0]);
            array_pop($pathsplit);
            array_push($pathsplit, $relative_link);
            $ret_url = rel2abs(join($pathsplit, '/'), $this->relative_base);
        }

        /* the stored link could be an absolute path */
        if($relative_link[0] == '/' || $relative_link[0] == '.') {
            $ret_url = rel2abs($relative_link, $this->relative_base);
        }

        if(!isset($ret_url)) {
            $ret_url = $this->relative_base.$relative_link;
        }

        return $ret_url;
    }

    function set_http_base($url) {
        $this->relative_base = $url;
    }

    function few_infos() {
        print "base:\t".$this->relative_base."\n";
        if(isset($this->table)) {
            print "refr:\t".count($this->reftable)."\n";
            print "elem:\t".count($this->table)."\n";
        }
        else
            print "URLs table not set\n";
    }

    function lot_infos() {
        print_r($this->reftable);
        print_r($this->table);
        print_r($this->sequenced_table);
    }

};

function new_http_req($link_url) {
    $retrivered = get_links($link_url);
    print "requested = ".$link_url." return ".count($retrivered)." elements\n";
    return $retrivered;
}

    /* * * *                                  * * * * *
     *                  HERE START                    *
     * * * *                                  * * * * */
if(isset($argv[1])) {
    $i =(int)$argv[1];
}
else {
    print "first argument need to be the number of iteration\n";
    exit;
}

$textTOsend = "ABCDEabcdeABCDEabcdE!42";
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

$test = $nuovoddio->get_node_by_link('subdir-2/index.html');

$last_link_block = new_http_req('subdir-5/index.html');

$nuovoddio->expand_node_list($relative_base, $last_link_block);

?>
