<?
/* the encoder need to be written in js, but before I want study the logic,
 * question ? https://github.com/vecna/stegoclick
 * http://www.delirandom.net/stegoclick (entire project)
 * http://www.delirandom.net/oddio (encoding library, studies, etc)
 */

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

    /*
    function recursive_dump($filestream, $stringprefix, $node) {
    }

    function special_tree_dump($filesuffix) {
        $fdest = fopen('incremental_log/special_tree_dump_'.$filesuffix.'.log', 'w+');
        
    }
    */

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
        $ret = "u=".$this->strip_url($this->url)." ID=".$this->ID;

        if($this->shadow_value)
            $ret .= " sv=".$this->shadow_value;

        return $ret;
    }

    function full_info_str() {
        $acc = '';

        if( $this->am_i_fetched() )
            $acc = "+fetch ";
        else
            $acc = "-!fetch ";

        $acc .= "u=".$this->strip_url($this->url)." ID=".$this->ID;
        if(isset($this->shadow_value))
            $acc .= " sv=".$this->shadow_value;
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
        $this->url = rel2abs($myurl, oddio_node::$oddio_master_obj->relative_base);

        $this->value = $starting_value;
        $this->shadow_value = 0;

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

    function append_links($referer, $links) 
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
            recursion logic: every node has a "projected value" based on the number of links he could reach in N clicks
         */
        $TEST_VALUE = 3;
        $this->save_log('recursion', "starting recursion (".$this->url.") add ".$this->child_count." layer value of ".$TEST_VALUE."\n");
        $this->save_log('recursion', "the new childs: ".oddio_node::$oddio_master_obj->get_fetched_list($this->url)."\n");
        $this->shadow_value = $this->get_shadow_value($TEST_VALUE, $this->strip_url($this->url));
        
        $this->save_log('recursion', "obtained a shadow value of ".$this->shadow_value."\n\n");
    }

    /* recursive function called here over - hypotetically need to be called every time a new link is fetched, in every node */
    function get_shadow_value($layers, $caller_str) 
    {
        if($this->shadow_value)
            $this->save_log('recursion', "shadow value already present: ".$this->simple_info_str()."\n");

        $this->shadow_value = 0;

        if(!isset($this->child_nodes)) {
            $this->shadow_value = 1;
            $this->save_log('recursion', " [".$caller_str."] layers #".$layers.": ".$this->simple_info_str()." no child: 1\n");
            return 1;
        }

        if($layers == 0) {
            $this->shadow_value = $this->child_count;
            $this->save_log('recursion', " [".$caller_str."] NO layers, return child count: ".$this->child_count." in ".$this->strip_url($this->url)."\n");
            return $this->shadow_value;
        }

        $this->save_log('recursion', " [".$caller_str."] layers #".$layers.": ".$this->simple_info_str()." childs: ".$this->child_count."\n");
        for($i = 0; $i < $layers; ) 
        {
            /* the increment is moved from the 'for' for recursion logic */
            $i++;

            foreach($this->child_nodes as $child_node) 
            {
                if(oddio_node::$oddio_master_obj->is_fetched($child_node->url))
                    $this->shadow_value += $child_node->get_shadow_value( ($layers - $i), $caller_str);
                else {
                    $this->save_log('recursion', "!fetch child: ".$child_node->url." using 1 \n");
                    $this->shadow_value += 1;
                }
            }
        }
        return $this->shadow_value;
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

    /* benefibra, contro la stitichezza */

    /* the following old function is not more called */
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
