<?
/* the encoder need to be written in js, but before I want study the logic,
 * question ? https://github.com/vecna/stegoclick
 * http://www.delirandom.net/stegoclick (entire project)
 * http://www.delirandom.net/oddio (encoding library, studies, etc)
 */

/* log is setup via log::log_setup in the oddio-test.php */
class log 
{
    static $avail = array('recursion', 'fetch', 'table', 'utility', 'nodeobj', 'error');
    static $output = array();
    static $incremental = array();
    static $action_id = 0;
    static $logdir;

    /* this variable is used inside every oddio_node generated */
    static $ID_counter = 0;

    static function log_setup($output_kinds, $incremental_kinds, $setup_logdir) 
    {
        log::$logdir = $setup_logdir;

        foreach(log::$avail as $single_av) 
        {
            foreach($output_kinds as $kind)
                if ($kind == $single_av)
                    log::$output[$kind] = 'x';

            foreach($incremental_kinds as $kind)
                if ($kind == $single_av)
                    log::$incremental[$kind] = 'x';
        }
    }

    static function get_incremental_ID() 
    {
        log::$ID_counter += 1;
        return log::$ID_counter;
    }

    /* if isset, then is outputed, in both case, il logged */
    static function save_log($kind,  $string) 
    {
        if (isset(log::$output[$kind])) {
            print $string;
        }

        if (isset(log::$incremental[$kind])) 
        {
            $log = fopen(log::$logdir.$kind.'-'.log::$action_id.'.log', 'a+');
            fwrite($log, $string);
        }
        else {
            $log = fopen(log::$logdir.$kind.'.log', 'a+');
            fwrite($log, log::$action_id." ''' ".$string);
        }

        fclose($log);
    }
}

class oddio extends log
{
    public $start_node;
    /* umh, at the moment has no a real use! */
    public $urlobj_table;
    /* this is the base of the relative path, eg: http://host.cx:port/wordpress/ */
    public $relative_base;
    /* the fetched url = array ( true | false, array ('childurl1', 'childurl2', ...) */
    public $fetched;

    /* from http://x.to/blah/foo/doh.html you read test.html, need to get http://x.to/blah/foo/ */
    function strip_file_from_http_path($url) {
        return substr($url, 0, strlen($url) - strlen(strrchr($url, '/'))).'/';
    }

    function clean_retrivered($source, $unclean_links)
    {
        $base2check = $this->relative_base;

        /* some page could have not links */
        if( !isset($unclean_links) || !count($unclean_links) ) {
            $this->save_log('fetch', "page ".$referer." has not link inside!\n");
            return;
        }

        /* only unique links, obtain absolute url, strip external */
        foreach($unclean_links as $unclean_link)
        {
            $cleaned_link = rel2abs($unclean_link, $this->strip_file_from_http_path($referer));
            $this->save_log('parsing', 'from: "'.$unclean_link.'" relative: "'.($referer).'" link: "'.$cleaned_link."\n");

            if(strstr($cleaned_link, $base2check) == false) {
                $this->save_log('parsing', 'stripping because as external link: '.$cleaned_link."\n");
                continue;
            }

            if(!isset($links[$cleaned_link]))
                $links[$cleaned_link] = 1;
            else
                $links[$cleaned_link]++;
        }
        $this->save_log('fetch', "page ".$referer." from ".count($unclean_links)." had now ".count($links)."\n");

        return $links;
    }

    /* DIO PORCO! non so se usare questa linea singola di url, o se la combo ref+url, penso la prima
         così la ref+url si aggiorna on demand */
    function get_first_unfetched()
    {
        foreach($this->fetched as $url => $array_info_fetch)
        {
            if($array_info_fetch[0] == false) {
                $this->save_log('utility', "first unfetch: ".$url." ".$this->relative_base." =".rel2abs($url, $this->relative_base)."\n");
                return rel2abs($url, $this->relative_base);
            }
        }
        return null;
    }

    function add_retrivered_links($source, $links) 
    {
        if(isset($this->fetched[$source])) {
            $this->save_log('fetch', $source." switch to true, with ".count($links)." childs\n");
        } else {
            $this->save_log('fetch', "bad/error ? ".$source." not present! set to true, with ".count($links)." childs\n");
        }

        $this->fetched[$source][0] = true;
        $this->fetched[$source][1] = $links;

        foreach($links as $urltofetch)
            if(!isset($this->fetched[$urltofetch]))
                $this->fetched[$urltofetch][0] = false;
    }

    function is_fetched($url) {
        return ( isset($this->fetched[$url]) && ($this->fetched[$url][0] == true) );
    }

    function get_fetched_links($url) 
    {
        if( isset($this->fetched[$url]) && ($this->fetched[$url][0] == true) );
            return $this->fetched[$url][1];
    }

    function oddio($schema_file=null) 
    {
        if(isset($schema_file)) {
            print "schema file not supported atm\n";
            exit;
        }

        oddio_node::$oddio_master_obj = $this;
    }

    /* oddio_start is called only at the start of the collection */
    function oddio_start($relative_base, $links) {
        $this->relative_base = $relative_base;
        $this->start_node = new oddio_node($relative_base, 0, null, $this);
        $this->start_node->append_links($relative_base, $links);
    }

    /* is the last child of the tree with the higtest value */
    function get_max_value() {
        /* is a recursive function */
        return $this->start_node->get_highest_value();
    }

    function record_urlobj_table($father_debstr, $referer, $nodeobj) 
    {
        $combokey = data2combo($referer, $nodeobj->url, $this->relative_base);

        if(isset($this->urlobj_table[$combokey])) {
            $this->save_log('table', "ignored record_urlobj".$combokey." ".$nodeobj->simple_info_str()." by{".$father_debstr."}\n");
        }
        else 
        {
            $this->urlobj_table[$combokey] = $nodeobj;
            $this->save_log('table', "record_urlobj [".$combokey."] ".$nodeobj->simple_info_str()." by{".$father_debstr."} #".count($this->urlobj_table)."\n");
        }
    }

    function search_urlobj_table($referer, $abs_url) 
    {
        $combokey = data2combo($referer, $abs_url, $this->relative_base);

        if(isset($this->urlobj_table[$combokey])) 
            return $this->urlobj_table[$combokey];

        return null;
    }

    function get_node_by_child($url) 
    {
        $ret = array();
        foreach($this->urlobj_table as $key => $node) 
        {
            /* not really efficent maybe ? */
            if($node->url == $url)
                array_push($ret, $node);
        }

        $this->save_log('table', "node by child ".$url.": #".count($ret)."\n");

        if(count($ret))
            return $ret;
    }

    function incremental_nodes_dump($log_suffix) 
    {
        $index = 0;
        $loghandler = fopen(log::$logdir.'incremental_node_dump-'.$log_suffix.'.log', 'w+');

        foreach($this->urlobj_table as $key => $node) 
        {
            $index++;

            fwrite($loghandler, $index."] ".$key." ".$node->full_info_str()."\n");
        }
        fclose($loghandler);
    }
};

function data2combo($url1, $url2, $base2strip) {
    return substr($url1, strlen($base2strip)).'!'.substr($url2, strlen($base2strip));
}

/* get_links(), @author Jay Gilford */
function get_links($url) {

    // Create a new DOM Document to hold our webpage structure
    $xml = new DOMDocument();
    $xml->strictErrorChecking = false;
 
    // Load the url's contents into the DOM
    $xml->loadHTMLFile($url);
 
    // Empty array to hold all links to return
    $links = array();
 
    // Loop through each <a> tag in the dom and add it to the link array
    foreach($xml->getElementsByTagName('a') as $link) {
        /* $links[] = array('url' => $link->getAttribute('href'), 'text' => $link->nodeValue); */
        $links[] = $link->getAttribute('href');
    }

    // print "get_links ($url) return ".count($links)." links\n";

    log::save_log( 'fetch', 'from '.$url.' get '.count($links)." links\n");
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

/* oddio_node define the single element, with some recursion logic */

class oddio_node extends log
{
    public $url;

    /* the child are the node/links available clicking on '$this->url' */
    public $child_nodes = array();
    public $child_count = 0;
    /* the next are the link available in the same page of '$this->url' */
    public $next_node;
    /* next is a linked link containing all the link retrivered clicking on $father_node->url */
    public $father_node; 

    /* value is the expressed value when this oddio_node is choosen */
    public $value = 0;
    
    /* different path able to reach this url-node */
    public $reached = 0;

    static public $oddio_master_obj;

    /* return url without the fixed base - used in logging */
    function strip_url($url) 
    {
        $base_url = oddio_node::$oddio_master_obj->relative_base;
        return substr($url, strlen($base_url));
    }

    function am_i_fetched() {
        return oddio_node::$oddio_master_obj->is_fetched($this->url);
    }

    function simple_info_str() {
        return "u=".$this->strip_url($this->url)." v=".$this->value." ID=".$this->ID;
    }

    function full_info_str() {
        $acc = '';

        if( $this->am_i_fetched() )
            $acc = "+fetch ";
        else
            $acc = "-!fetch ";

        $acc .= "u=".$this->strip_url($this->url)." v=".$this->value." ID=".$this->ID;
        if(isset($this->father_node))
            $acc .= " f=".$this->strip_url($this->father_node->url)." fv=".$this->father_node->value;
        if(isset($this->next_node))
            $acc .= " n=".$this->strip_url($this->next_node->url)." nv=".$this->next_node->value;
        if($this->child_count)  {
            $st = $this->child_nodes[0];
            $nd = $this->child_nodes[$this->child_count -1];
            $acc .= " c#=".$this->child_count." 1st_v=".$st->value." 2nd_v=".$nd->value;
        }
        return $acc;
    }

    function oddio_node($myurl, $starting_value, $calling_obj) 
    {
        $this->url= rel2abs($myurl, oddio_node::$oddio_master_obj->relative_base);
        $this->value = $starting_value;

        $this->ID = log::get_incremental_ID();

        if(isset($calling_obj)) {
            $this->father_node = $calling_obj;
            $this->save_log('nodeobj', "  new oddio_node: ".$this->simple_info_str()." from $calling_obj->url\n");

            oddio_node::$oddio_master_obj->record_urlobj_table($calling_obj->simple_info_str(), $calling_obj->url, $this);
        } else {
            $this->father_node = null;
            $father_debug_string = "1st obj, new oddio_node: ";
            $this->save_log('nodeobj', "  ".$father_debug_string.": ".$this->simple_info_str()."\n");

            oddio_node::$oddio_master_obj->record_urlobj_table($father_debug_string, '', $this);
        }
    }

    function append_links($referer, $unclean_links) 
    {
        /* check the call happen in the right node */
        if($referer != $this->url) {
            $this->save_log('error', "Invalid usage of append_link (".$referer.' called in '.$this->url.")\n");
            exit;
        }

        $previous_obj; $inuse_obj; foreach($links as $link => $amount) 
        {
            $this->child_count++;

            /* does this link exist ? - if exist, work on the existing node obj, but 
               track them inside the large tree of dynamic encoding */
            $inuse_obj = oddio_node::$oddio_master_obj->search_urlobj_table($referer, $link);

            if(isset($inuse_obj))
            {
                $inuse_obj->reached++;
                $this->save_log('nodeobj', "recovered existing obj (".$link." #".$amount.") ".$inuse_obj->simple_info_str()."\n");
            }
            else {
                $this->save_log('nodeobj', "creating a new obj (".$link." #".$amount.") from: ".$this->simple_info_str()."\n");
                $inuse_obj= new oddio_node($link, $this->value + $this->child_count, $this);
            }

            array_push($this->child_nodes, $inuse_obj);

            if(isset($previous_obj))
                $previous_obj->next_node = $inuse_obj;

            $previous_obj = $inuse_obj;
        }
        $this->save_log('append_links', "completed append_links, obj full resume: ".$this->full_info_str()."\n");

        /* 
            recursion logic - because every increment require an update on the node 'after' $this:

            the new added childs has the $this->value + [incremental val]
             if the next has child, increment
             if there are next, increment
             if have a father node, increment [*]
         */
        $this->recursive_increment("start", $this->child_count, $this, true);
    }

    /* utility function that return the last node in the next_node chain */
    function get_last_brother() {

        if(!isset($next_node))
            return $this;

        $node_iterator = $this->next_node;

        while(isset($node_iterator->next_node))
            $node_iterator = $node_iterator->next_node;

        return $node_iterator;
    }

    function get_highest_value() 
    {
        $little_bro = $this->get_last_brother();

        $this->save_log('utility', "last brother of ".$this->simple_info_str()." is ".$little_bro->simple_info_str()."\n");

        if($little_bro->child_count) 
        {
            $index = ($little_bro->child_count - 1);
            $target_obj = $little_bro->child_nodes[$index];

            $this->save_log('utility', "last bro ".$little_bro->simple_info_str()." has the last child ".$target_obj->simple_info_str()."\n");

            return $target_obj->get_highest_value();
        }

        return $little_bro->value;
    }

    function recursive_increment($debug_info, $delta, $calling_obj, $avoid_child_inc) 
    {
        if(isset($calling_obj))
            $this->save_log('recursion', "++ ".$debug_info." ".$this->simple_info_str()." calling: ".$calling_obj->full_info_str()."\n");

        /* first node ? the child has already added, skip to $this->next_node */
        if($avoid_child_inc) {
            $this->save_log('recursion', $debug_info." not value inc of ".$delta.", nor child recursion ".$this->simple_info_str()."\n");
        }
        else {
            $this->save_log('recursion', $debug_info." self increment of ".$delta." ".$this->simple_info_str()."\n");
            $this->value += $delta;

            foreach($this->child_nodes as $child) {
                $this->save_log('recursion', $debug_info." child increment of ".$delta." ".$this->simple_info_str()."\n");
                $child->recursive_increment("child ".$debug_info, $delta, $this, false);
            }
        }

        /* skip to next if exist */
        if(isset($this->next_node)) 
        {
            $obj_iterator = $this->next_node;

            $this->save_log('recursion', $debug_info." recurs for next_node incrm ".$delta." ".$obj_iterator->simple_info_str()."\n");

            $obj_iterator->recursive_increment("brother ".$debug_info, $delta, $this, false);

        } else {
            $this->save_log('recursion', $debug_info." last_node is ".$this->full_info_str()."\n");
        }

        /* if has a father, call it:
            is set 'true' as avoid child increment, because him child had already been incremented
            is called only when avoid_child_inc is true, because for all brother, only one time need to scale on the father 
         */
        if($avoid_child_inc && isset($this->father_node)) {
            $target_node = $this->father_node;
            $this->save_log('recursion', $debug_info." hook to the father ".$target_node->full_info_str()." from ".$this->simple_info_str()."\n");
            $target_node->recursive_increment("father ".$debug_info, $delta, $this, true);
        }
    }
};

?>
