<?
/* the encoder need to be written in js, but before I want study the logic,
 * question ? https://github.com/vecna/stegoclick
 * http://www.delirandom.net/stegoclick (entire project)
 * http://www.delirandom.net/oddio (encoding library, studies, etc)
 */

/* log is setup via log::log_setup in the oddio-test.php */
class log 
{
    static $avail = array('recursion', 'fetch', 'table', 'utility', 'nodeobj', 'error', 'parsing', 'retrivered-table');
    /* and exist the special keyword: 'all'. TODO: 'none' */
    static $output = array();
    static $incremental = array();
    static $action_id = 0;
    static $logdir;
    static $all_request = false;

    /* this variable is used inside every oddio_node generated */
    static $ID_counter = 0;

    static function log_setup($output_kinds, $incremental_kinds, $setup_logdir) 
    {
        log::$logdir = $setup_logdir;

        foreach(log::$avail as $single_available) 
        {
            foreach($output_kinds as $kind) 
            {
                if ($kind == $single_available)
                    log::$output[$kind] = 'x';

                if ($kind == 'all')
                    log::$all_request = true;
            }

            foreach($incremental_kinds as $kind)
                if ($kind == $single_available)
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
        /* not all logs are written on stdout - except when 'all' keyword is used */
        if (isset(log::$output[$kind]) || log::$all_request) {
            print $string;
        }

        /* all log are dumped in a file, some logs splitted by the incrementd step ID */
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
        $base2check = $this->strip_file_from_http_path($this->relative_base);

        /* some page could have not links */
        if( !isset($unclean_links) || !count($unclean_links) ) {
            $this->save_log('fetch', "page ".$source." has not link inside!\n");
            return;
        }

        /* only unique links, obtain absolute url, strip external */
        foreach($unclean_links as $unclean_link)
        {
            $cleaned_link = rel2abs($unclean_link, $this->strip_file_from_http_path($source));
            $this->save_log('parsing', 'from: "'.$unclean_link.'" relative: "'.($source).'" link: "'.$cleaned_link."\n");

            if(strstr($cleaned_link, $base2check) == false) {
                $this->save_log('parsing', 'stripping because as external link: '.$cleaned_link."\n");
                continue;
            }

            if(!isset($links[$cleaned_link]))
                $links[$cleaned_link] = 1;
            else
                $links[$cleaned_link]++;
        }
        $this->save_log('fetch', "page ".$source." from ".count($unclean_links)." had now ".count($links)."\n");

        return $links;
    }

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

    function get_fetched_list($url) 
    {
        if(!($this->is_fetched($url)))
            return "error in consulting get_fetched_link with a non fetched url: ".$url;

        $childlist = '';
        $childarray = $this->fetched[$url][1];

        foreach($childarray as $childurl => $useless)
            $childlist .= substr($childurl, strlen($this->relative_base) )." ";

        return $childlist;
    }

    function align_fetching($source, $links) 
    {
        /* this is an heavy debug effect! */
        foreach($this->fetched as $existenturl => $url_value_array) 
        {
            if($url_value_array[0] == true) 
            {
                $this->save_log('retrivered-table', $existenturl."# ".$url_value_array[2]." (".$this->get_fetched_list($existenturl).")\n");
            } else {
                $this->save_log('retrivered-table', $existenturl." not fetched\n");
            }
        }
        /* end of the heavy debug effect */

        if(isset($this->fetched[$source])) {
            $this->save_log('fetch', "setting true ".$source." switch to true, with ".count($links)." childs\n");
        } else {
            $this->save_log('fetch', "odd if not first: ".$source." not present! set to true, with ".count($links)." childs\n");
        }

        /* fill the "url_value_array" */
        $this->fetched[$source][0] = true;
        $this->fetched[$source][1] = $links;
        $this->fetched[$source][2] = count($links);

        foreach($links as $urltofetch => $uselessvalue)
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
        $this->start_node = new oddio_node($relative_base, 1, null);
        $this->start_node->append_links($relative_base, $links);
    }

    /* is the last child of the tree with the higtest value */
    function get_max_value() {
        /* is a recursive function */
        return $this->start_node->get_highest_value();
    }

    /* when new link has been fetched, this function update urlobj table and 
        create, in the appropriate node, the child */
    function urlobj_table_updater($node_to_update, $source, $urls_in_source)
    {
        $increment_value = 0;

        foreach($node_to_update as $node) {
            $this->save_log('table', "urlojb_updated append ".$source." #".count($urls_in_source)." amount of #".count($node_to_update)."\n");
            $node->append_links($source, $urls_in_source);
        }

        /* the first node need to be the one where recursion start, the recursion
            count all the childs, fixing also the projected value */
        /* $starting_recursion = array_pop($node_to_update); */

        /* deepness of projecton need here to be specify - if used */
        /* $starting_recursion->get_shadow_value(); */
        /* at the moment, the shadow_value works for a single node only */
        $accumulated_value = '';
        foreach($node_to_update as $node) {
            $accumulated_value .= '['.substr($node->url, strlen($this->relative_base)).' = '.$node->shadow_value."]";
        }
        $this->save_log('utility', "adding ".count($urls_in_source)." urls in ".count($node_to_update)." related node, cause values of:\n");
        $this->save_log('utility', "  ".$accumulated_value."\n");
    
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

?>
