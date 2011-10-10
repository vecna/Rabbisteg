/*
 * this code is copyed by http://www.its.caltech.edu/~cswchang/rscodec.html
 * that's is a non licensed software, and implement the Reed Solomon
 * error correction algoritm.
 *
 * https://secure.wikimedia.org/wikipedia/en/wiki/Reed-Solomon
 * 
 * primitive:

encodeI() need to be expanded instead take the name of the example elements




 */

// (31,15) RS Code in GF(32) with primitive poly x^5 + x^2 + 1

var Q = 32;
var N = 31;
var K = 15;
var chars;
var pwr_table;
var add_table;
var mul_table;
var input_I;
var input_R;
var o;
var otfmode;
var verbosemode;

function init()
{

chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456?";

pwr_table = [1,2,4,8,16,5,10,20,13,26,17,7,14,28,29,31,27,19,3,6,12,24,21,15,30,25,23,11,22,9,18];

add_table = [
[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31],
[1,0,3,2,5,4,7,6,9,8,11,10,13,12,15,14,17,16,19,18,21,20,23,22,25,24,27,26,29,28,31,30],
[2,3,0,1,6,7,4,5,10,11,8,9,14,15,12,13,18,19,16,17,22,23,20,21,26,27,24,25,30,31,28,29],
[3,2,1,0,7,6,5,4,11,10,9,8,15,14,13,12,19,18,17,16,23,22,21,20,27,26,25,24,31,30,29,28],
[4,5,6,7,0,1,2,3,12,13,14,15,8,9,10,11,20,21,22,23,16,17,18,19,28,29,30,31,24,25,26,27],
[5,4,7,6,1,0,3,2,13,12,15,14,9,8,11,10,21,20,23,22,17,16,19,18,29,28,31,30,25,24,27,26],
[6,7,4,5,2,3,0,1,14,15,12,13,10,11,8,9,22,23,20,21,18,19,16,17,30,31,28,29,26,27,24,25],
[7,6,5,4,3,2,1,0,15,14,13,12,11,10,9,8,23,22,21,20,19,18,17,16,31,30,29,28,27,26,25,24],
[8,9,10,11,12,13,14,15,0,1,2,3,4,5,6,7,24,25,26,27,28,29,30,31,16,17,18,19,20,21,22,23],
[9,8,11,10,13,12,15,14,1,0,3,2,5,4,7,6,25,24,27,26,29,28,31,30,17,16,19,18,21,20,23,22],
[10,11,8,9,14,15,12,13,2,3,0,1,6,7,4,5,26,27,24,25,30,31,28,29,18,19,16,17,22,23,20,21],
[11,10,9,8,15,14,13,12,3,2,1,0,7,6,5,4,27,26,25,24,31,30,29,28,19,18,17,16,23,22,21,20],
[12,13,14,15,8,9,10,11,4,5,6,7,0,1,2,3,28,29,30,31,24,25,26,27,20,21,22,23,16,17,18,19],
[13,12,15,14,9,8,11,10,5,4,7,6,1,0,3,2,29,28,31,30,25,24,27,26,21,20,23,22,17,16,19,18],
[14,15,12,13,10,11,8,9,6,7,4,5,2,3,0,1,30,31,28,29,26,27,24,25,22,23,20,21,18,19,16,17],
[15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0,31,30,29,28,27,26,25,24,23,22,21,20,19,18,17,16],
[16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
[17,16,19,18,21,20,23,22,25,24,27,26,29,28,31,30,1,0,3,2,5,4,7,6,9,8,11,10,13,12,15,14],
[18,19,16,17,22,23,20,21,26,27,24,25,30,31,28,29,2,3,0,1,6,7,4,5,10,11,8,9,14,15,12,13],
[19,18,17,16,23,22,21,20,27,26,25,24,31,30,29,28,3,2,1,0,7,6,5,4,11,10,9,8,15,14,13,12],
[20,21,22,23,16,17,18,19,28,29,30,31,24,25,26,27,4,5,6,7,0,1,2,3,12,13,14,15,8,9,10,11],
[21,20,23,22,17,16,19,18,29,28,31,30,25,24,27,26,5,4,7,6,1,0,3,2,13,12,15,14,9,8,11,10],
[22,23,20,21,18,19,16,17,30,31,28,29,26,27,24,25,6,7,4,5,2,3,0,1,14,15,12,13,10,11,8,9],
[23,22,21,20,19,18,17,16,31,30,29,28,27,26,25,24,7,6,5,4,3,2,1,0,15,14,13,12,11,10,9,8],
[24,25,26,27,28,29,30,31,16,17,18,19,20,21,22,23,8,9,10,11,12,13,14,15,0,1,2,3,4,5,6,7],
[25,24,27,26,29,28,31,30,17,16,19,18,21,20,23,22,9,8,11,10,13,12,15,14,1,0,3,2,5,4,7,6],
[26,27,24,25,30,31,28,29,18,19,16,17,22,23,20,21,10,11,8,9,14,15,12,13,2,3,0,1,6,7,4,5],
[27,26,25,24,31,30,29,28,19,18,17,16,23,22,21,20,11,10,9,8,15,14,13,12,3,2,1,0,7,6,5,4],
[28,29,30,31,24,25,26,27,20,21,22,23,16,17,18,19,12,13,14,15,8,9,10,11,4,5,6,7,0,1,2,3],
[29,28,31,30,25,24,27,26,21,20,23,22,17,16,19,18,13,12,15,14,9,8,11,10,5,4,7,6,1,0,3,2],
[30,31,28,29,26,27,24,25,22,23,20,21,18,19,16,17,14,15,12,13,10,11,8,9,6,7,4,5,2,3,0,1],
[31,30,29,28,27,26,25,24,23,22,21,20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0]];

mul_table = [
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31],
[0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,5,7,1,3,13,15,9,11,21,23,17,19,29,31,25,27],
[0,3,6,5,12,15,10,9,24,27,30,29,20,23,18,17,21,22,19,16,25,26,31,28,13,14,11,8,1,2,7,4],
[0,4,8,12,16,20,24,28,5,1,13,9,21,17,29,25,10,14,2,6,26,30,18,22,15,11,7,3,31,27,23,19],
[0,5,10,15,20,17,30,27,13,8,7,2,25,28,19,22,26,31,16,21,14,11,4,1,23,18,29,24,3,6,9,12],
[0,6,12,10,24,30,20,18,21,19,25,31,13,11,1,7,15,9,3,5,23,17,27,29,26,28,22,16,2,4,14,8],
[0,7,14,9,28,27,18,21,29,26,19,20,1,6,15,8,31,24,17,22,3,4,13,10,2,5,12,11,30,25,16,23],
[0,8,16,24,5,13,21,29,10,2,26,18,15,7,31,23,20,28,4,12,17,25,1,9,30,22,14,6,27,19,11,3],
[0,9,18,27,1,8,19,26,2,11,16,25,3,10,17,24,4,13,22,31,5,12,23,30,6,15,20,29,7,14,21,28],
[0,10,20,30,13,7,25,19,26,16,14,4,23,29,3,9,17,27,5,15,28,22,8,2,11,1,31,21,6,12,18,24],
[0,11,22,29,9,2,31,20,18,25,4,15,27,16,13,6,1,10,23,28,8,3,30,21,19,24,5,14,26,17,12,7],
[0,12,24,20,21,25,13,1,15,3,23,27,26,22,2,14,30,18,6,10,11,7,19,31,17,29,9,5,4,8,28,16],
[0,13,26,23,17,28,11,6,7,10,29,16,22,27,12,1,14,3,20,25,31,18,5,8,9,4,19,30,24,21,2,15],
[0,14,28,18,29,19,1,15,31,17,3,13,2,12,30,16,27,21,7,9,6,8,26,20,4,10,24,22,25,23,5,11],
[0,15,30,17,25,22,7,8,23,24,9,6,14,1,16,31,11,4,21,26,18,29,12,3,28,19,2,13,5,10,27,20],
[0,16,5,21,10,26,15,31,20,4,17,1,30,14,27,11,13,29,8,24,7,23,2,18,25,9,28,12,19,3,22,6],
[0,17,7,22,14,31,9,24,28,13,27,10,18,3,21,4,29,12,26,11,19,2,20,5,1,16,6,23,15,30,8,25],
[0,18,1,19,2,16,3,17,4,22,5,23,6,20,7,21,8,26,9,27,10,24,11,25,12,30,13,31,14,28,15,29],
[0,19,3,16,6,21,5,22,12,31,15,28,10,25,9,26,24,11,27,8,30,13,29,14,20,7,23,4,18,1,17,2],
[0,20,13,25,26,14,23,3,17,5,28,8,11,31,6,18,7,19,10,30,29,9,16,4,22,2,27,15,12,24,1,21],
[0,21,15,26,30,11,17,4,25,12,22,3,7,18,8,29,23,2,24,13,9,28,6,19,14,27,1,20,16,5,31,10],
[0,22,9,31,18,4,27,13,1,23,8,30,19,5,26,12,2,20,11,29,16,6,25,15,3,21,10,28,17,7,24,14],
[0,23,11,28,22,1,29,10,9,30,2,21,31,8,20,3,18,5,25,14,4,19,15,24,27,12,16,7,13,26,6,17],
[0,24,21,13,15,23,26,2,30,6,11,19,17,9,4,28,25,1,12,20,22,14,3,27,7,31,18,10,8,16,29,5],
[0,25,23,14,11,18,28,5,22,15,1,24,29,4,10,19,9,16,30,7,2,27,21,12,31,6,8,17,20,13,3,26],
[0,26,17,11,7,29,22,12,14,20,31,5,9,19,24,2,28,6,13,23,27,1,10,16,18,8,3,25,21,15,4,30],
[0,27,19,8,3,24,16,11,6,29,21,14,5,30,22,13,12,23,31,4,15,20,28,7,10,17,25,2,9,18,26,1],
[0,28,29,1,31,3,2,30,27,7,6,26,4,24,25,5,19,15,14,18,12,16,17,13,8,20,21,9,23,11,10,22],
[0,29,31,2,27,6,4,25,19,14,12,17,8,21,23,10,3,30,28,1,24,5,7,26,16,13,15,18,11,22,20,9],
[0,30,25,7,23,9,14,16,11,21,18,12,28,2,5,27,22,8,15,17,1,31,24,6,29,3,4,26,10,20,19,13],
[0,31,27,4,19,12,8,23,3,28,24,7,16,15,11,20,6,25,29,2,21,10,14,17,5,26,30,1,22,9,13,18]];

input_I = "";
input_R = "";
o = "";

otfmode = false;
document.getElementById("otf").checked = false;

verbosemode = true;
document.getElementById("verbose").checked = true;

}

function clearOutput()
{
    o = "";
    showOutput();
}

function showOutput()
{
    document.getElementById("t").value = o; // show output text box
}

function pl(s)
{
    //if (verbosemode) document.getElementById("t").value += "\n" + s;
    if (verbosemode) o += "\n" + s;
}
function error(e)
{
    o += "\n\nError: " + e;
    return;
}

function pwr(i_)
{
    var i = i_ % (Q - 1);
    if (i < 0) i += (Q - 1);
    return pwr_table[i];
}

function add(a,b)
{
    return add_table[a][b];
}

function mul(a,b)
{
    return mul_table[a][b];
}

function div(a,b)
{
    if (b == 0)
    {   
        error("Division by zero.");
        return;
    }
    
    for (var i = 0; i < Q; i++)
    {
        if (mul_table[b][i] == a) return i;
    }
}

function trimpoly(p_)
{
    // Trim polynomial p by dropping leading zeros  
    var keep = 0;
    var p = []; // return value
    var p_len = p_.length;
    
    for (var i = 0; i < p_len; i++)
    {
        if ((keep) || (p_[i] != 0))
        {
            p.push(p_[i]);
            keep = 1;
        }
    }
    
    return p;   
}

function polyadd(a_,b_)
{
    // Add two polys in the field GF(Q)
    
    var s = [];
    var a = trimpoly(a_);
    var b = trimpoly(b_);
    var a_len = a.length;
    var b_len = b.length;
    
    var min = (a_len < b_len) ? a_len : b_len;
    var max = (a_len > b_len) ? a_len : b_len;

    a.reverse();
    b.reverse();
    
    for (var i = 0; i < min; i++)
    {
        s.push(add(a[i],b[i])); 
    }
    
    for (var i = min; i < max; i++)
    {   
        s.push((a_len > b_len) ? a[i] : b[i]);
    }
    
    s.reverse();
    s = trimpoly(s);
    
    return s;
}

function polymul(a_,b_)
{
    // Perform polynomial multiplication
    // a(x) x b(x) = p(x)
    // a = [a_n-1, a_n-2, ..., a_1, a_0], lowest power on right
    // b = [b_n-1, b_n-2, ..., b_1, b_0], lowest power on right
    // The zero poly is denoted as []

    var p = [];
    
    // drop leading zeroes
    var a = trimpoly(a_);
    var b = trimpoly(b_);
    var a_len = a.length;
    var b_len = b.length;
    
    if ((a_len == 0) || (b_len == 0))
    {
        // multiplication by zero
        return p; // p = []
    }
    
    for (var i = 0; i < b_len; i++)
    {
        var p_i = [];
        
        for (var j = 0; j < a_len; j++)
        {
            p_i.push(mul(b[i],a[j]));       
        }
        
        for (var j = 1; j < b_len - i; j++)
        {
            p_i.push(0);
        }
        
        p = polyadd(p, p_i);    
    }
    
    p = trimpoly(p);
    return p;
}

function polydiv(a_,d_)
{
    // Perform polynomial division
    // Returns [q, r]
    // a(x) / d(x) = q(x) R r(x)
    // a = [a_n-1, a_n-2, ..., a_1, a_0], lowest power on right
    // d = [d_n-1, d_n-2, ..., d_1, d_0], lowest power on right
    // The zero poly is denoted as []
    
    var d = trimpoly(d_);
    if (d.length == 0) 
    {
        error('Division by zero');
        return;
    }

    var a = trimpoly(a_);
    if (a.length == 0) 
    {
        // the dividend is zero,
        // so the quotient are remainder are zero
        return [[], []];
    }
    
    var a_len = a.length;
    var d_len = d.length;

    if (a_len < d_len)
    {
        return [[], a];
    }
    
    // now, deg[a(x)] >= deg[d(x)]
    // perform long poly division
    
    var w = []; // w(x) is the working poly
    var i_a = 0; // index of a(x)'s coeff
    var q = []; // quotient of a(x) / d(x)
    
    while (1)
    {
        while (w.length < d_len)
        {
            // not enough coeffs in w(x); append the next coeff of a(x) 
            if (i_a >= a_len)
            {
                // no more coeffs left in a(x); end division
                return [trimpoly(q), trimpoly(w)];
            }
            
            w.push(a[i_a]);
            q.push(0); // pad quotient with a trailing zero coeff
            i_a ++;
        }
       
       // get rid of the last zero coeff in q(x)
       q.pop();
       
       // divide leading coeff of w(x) by leading coeff of d(x)
       var q_i = div(w[0], d[0]);
       q.push(q_i);
       
       // subtract the product d(x) x q_i from w(x)
       w = trimpoly(polyadd(w, polymul([q_i], d))); // minus = add, in GF(2)        
    }
}

function polyeea(a_,b_)
{
    // [i u v r q] = polyeea(a, b)
    var a = trimpoly(a_);
    var b = trimpoly(b_);
    
    // Javascript vector index offset
    var os = 1;
    
    // init
    var j = new Array();
    var u = new Array();
    var v = new Array();
    var r = new Array();
    var q = new Array();
    
    j[os-1] = -1;
    j[os+0] = 0;
    u[os-1] = [1];
    u[os+0] = [];
    v[os-1] = [];
    v[os+0] = [1];
    r[os-1] = a;
    r[os+0] = b;
    
    var i = 0; 
    var qr;
    
    while (r[os+i].length > 0)
    {
        j[os+i+1] = i + 1;
        qr = polydiv(r[os+i-1], r[os+i]);
        q[os+i+1] = qr[0];
        r[os+i+1] = qr[1];
        u[os+i+1] = polyadd(u[os+i-1], polymul(q[os+i+1], u[os+i])); // minus = add in GF(2)
        v[os+i+1] = polyadd(v[os+i-1], polymul(q[os+i+1], v[os+i])); // minus = add in GF(2)
        i ++;
    }
    
    /*
    for (i = 0; i < j.length; i++)
    {
        pl("i = " + j[i] + ":");
        pl("  u = " + u[i]);
        pl("  v = " + v[i]);
        pl("  r = " + r[i]);
        pl("  q = " + q[i]);
    }
    */
    
    return [j,u,v,r,q];
}

function trimstring(s_)
{
    // Trim leading and trailing spaces from s
    var s_len = s_.length;
    
    var i0;
    var i1;
    
    for (i0 = 0; i0 < s_len; i0++)
    {
        if (s_.charAt(i0) != ' ') break;
    }
    
    for (i1 = s_len - 1; i1 >= 0; i1--)
    {
        if (s_.charAt(i1) != ' ') break;
    }
    
    if (i0 == s_len) return ""; // empty string
    
    return s_.substring(i0, i1+1);
}

function dec(input_)
{
    // Perform Reed-Solomon decoding with erasures & errors
    // input = [R0 R1 R2 ... Rn-1], i.e. received vector
    
    // In the following code, we represent polynomials as:
    //   Rx = [Rn-1 Rn-2 ... R2 R1 R0], i.e. highest power first
    // On the other hand, we denote plain coefficients alone as:
    //   R  = [R0 R1 R2 ... Rn-2 Rn-1], i.e. highest power last

    var input = trimstring(input_).toUpperCase();
    
    pl("Decode(\""+input+"\"):");

    // return value
    var out;
    var qr;
    
    // Class Project (31,15) RS Code
    // Erasures are denoted by 32 or '?'    
    var R = [];
    
    for (var i = 0; i < input.length; i++)
    {
        var index = chars.indexOf(input.charAt(i));
        if (index < 0)
        {
            error("Invalid input; Elements must be in GF(32) = {A,B,...,Z,1,...,6}, or ? for erasure.");
            return;
        }
        R.push(index);
    }
    
    // Now, received vector R = [R0 R1 R2 ... Rn-1]
    if (R.length != N)
    {
        error("Input must contain "+N+" symbols; this has "+R.length+" symbols.");
        return;
    }
    
    pl("\nReceived vector:");
    pl("  R = [R0 R1 R2 ... Rn-1]");
    pl("    = ["+R+"]");
    
    // From this, we create the corresponding polynomial R(x) = [Rn-1 ... R1 R0],
    // by flipping the vector
    
    var Rx = R.concat().reverse();
    pl("\nReceived vector poly:");
    pl("  R(x) = [Rn-1 ... R2 R1 R0]");
    pl("       = ["+Rx+"]");    
    
    // We know the location of the erasures:
    
    // Erasure set I_0 = {i: Ri = '?', i=0,1,...,n-1}
    var I_0 = [];
    
    for (var i = 0; i < N; i++)
    {
        if (R[i] == Q)
        {
            // Ri is an erasure
            I_0.push(i);
        }
    }
    
    pl("\nErasure set:");
    pl("  I_0 = {i: Ri = '?'}");
    pl("      = {"+I_0+"}");
    
    // Number of erasures e_0 = |I_0|
    var e_0 = I_0.length;
    pl("\nNumber of erasures:");
    pl("  e_0 = |I_0|");
    pl("      = "+e_0);
    
    if (e_0 > (N - K)) // e_0 > r
    {
        error("\nDecoding failed: Up to r = "+(N-K)+" erasures are allowed, but this has "+e_0+" erasures.\nReceived vector R has too many erasures to correct.");
        return -1;
    }
    
    // Erasure locator poly sigma_0(x) = PROD{i=I_0} (1 - alpha^i x)
    var sigma_0x;
    sigma_0x = [1]; // init
    
    for (var k = 0; k < e_0; k++)
    {
        sigma_0x = polymul(sigma_0x, [pwr(I_0[k]), 1]);
    }
    
    pl("\nErasure locator poly:");
    pl("  sigma_0(x) = PROD{i=I_0} (1 - alpha^i x)");
    pl("             = ["+sigma_0x+"]");
    
    // Update received vector by replacing '?' by 0
    // Save original R as oldR
    var oldR = R.concat();
    
    for (var k = 0; k < e_0; k++)
    {
        R[I_0[k]] = 0; // replace '?' by 0
    }
    
    pl("\nUpdated received vector ('?' [32] replaced by 0):");
    pl("  R = [R0 R1 ... Rn-1]");
    pl("    = ["+R+"]");
    
    Rx = R.concat().reverse();
    pl("\nUpdated received vector poly:");
    pl("  R(x) = [Rn-1 ... R1 R0]");
    pl("       = ["+Rx+"]");
    
    // Syndrome poly S(x) = [Sr Sr-1 ... S2 S1], i.e. constant term is S1
    // where Sj = SUM{i=0:n-1} Ri alpha^(ij), j=1,...,r
    var Sx = [];
    
    for (var j = 1; j <= (N-K); j++) // j=1,...,r
    {
        var S_j = 0; // init
        
        for (var i = 0; i < N; i++)
        {
            S_j = add(S_j, mul(R[i], pwr(i*j)));
        }
        
        Sx.push(S_j);
    }
    
    Sx = trimpoly(Sx.reverse());
    
    pl("\nSyndrome poly S(x) = [Sr Sr-1 ... S2 S1], i.e. constant term is S1,");
    pl("where Sj = SUM{i=0:n-1} Ri alpha^(ij), j=1,...,r:");
    pl("  S(x) = [Sr Sr-1 ... S2 S1]");
    pl("       = ["+Sx+"]");
    
    if ((Sx.length == 0) && (e_0 == 0))
    {
        pl("No errors or erasures have occurred.");
        
        // prepare output
        out = "";
        
        for (var i = 0; i < N; i++)
        {
            out = out.concat(chars.charAt(R[i]));
        }
        pl("\nDecode(\""+input+"\") = \""+out+"\"");
        return out;
    }
    
    // Modified syndrome poly S_0(x) = (sigma_0(x) * S(x)) mod x^r
    var xr = [1]; // x^r
    
    // append r zeros
    for (var i = 0; i < (N-K); i++)
    {
        xr.push(0);
    }   
    
    var S_0x = polydiv(trimpoly(polymul(sigma_0x, Sx)), xr)[1];
    
    pl("\nModified syndrome poly:");
    pl("  S_0(x) = (sigma_0(x) * S(x)) mod x^r");
    pl("         = ["+S_0x+"]");
    
    if (S_0x.length == 0)
    {
        pl("The erasures were zeros.");
        
        // prepare output
        out = "";
        
        for (var i = 0; i < N; i++)
        {
            out = out.concat(chars.charAt(R[i]));
        }
        
        pl("\nDecode(\""+input+"\") = \""+out+"\"");
        return out;
    }
    
    var mu = Math.floor((N-K - e_0) / 2);
    var nu = Math.ceil((N-K + e_0) / 2) - 1;
    pl("\nStopping conditions for EEA:");
    pl("  mu = floor((r-e_0)/2)  = "+mu);
    pl("  nu = ceil((r+e_0)/2)-1 = "+nu);
    
    pl("\nEuclid(x^"+(N-K)+", S_0(x) = ["+S_0x+"], mu = "+mu+", nu = "+nu+"):");
    
    // Perform EEA(a = x^r, b = S_0(x))
    var iuvrq = polyeea(xr, S_0x);
    var ii = iuvrq[0];
    var uu = iuvrq[1];
    var vv = iuvrq[2];
    var rr = iuvrq[3];
    var qq = iuvrq[4];
        
    // step through the output of the EEA to look for the stopping conditions
    var found = 0;
    var kstop = 0;
    
    for (var k = 0; k < ii.length; k++)
    {   
        // output from the EEA
        var i   = ii[k];
        var u_i = uu[k];
        var v_i = vv[k];
        var r_i = rr[k];
        var q_i = qq[k];
        
        var deg_v_i = v_i.length - 1;
        if (deg_v_i < 0) deg_v_i = 0;
        
        var deg_r_i = r_i.length - 1;
        if (deg_r_i < 0) deg_r_i = 0;
        
        pl("\n  EEA:  i = "+i);
        pl("     u(x) = ["+u_i+"]");
        pl("     v(x) = ["+v_i+"]");
        pl("       deg[v(x)] = "+deg_v_i);
        pl("     r(x) = ["+r_i+"]");
        pl("       deg[r(x)] = "+deg_r_i);
        pl("     q(x) = ["+q_i+"]");
        
        // check degrees of v(x) and r(x) at this step of the EEA
        if ((deg_v_i <= mu) && (deg_r_i <= nu))
        {
            pl("     Stopping conditions MET at this step.");
            if (found == 0) kstop = k;
            found = found + 1;
        }
        else
        {
            pl("     Stopping conditions NOT met at this step.");  
        }
    }
    pl("\n  EEA: Algorithm terminated; r(x) = 0.");
    
    if (found == 0)
    {
        error("Decoding failed: Cannot find stopping conditions in EEA.\nReceived vector R has too many errors/erasures to correct.");
        return -1;   
    }
    else if (found > 1)
    {
        pl("Found more than one index i satisfying stopping conditions in EEA; we pick the first instance.");
    }
    
    // pick k = kstop
    pl("\nPick EEA index i = "+ii[kstop]+":");
    var v_i = vv[kstop];
    var r_i = rr[kstop];
    
    if (v_i.length == 0)
    {
        error("Decoding failed: v_i(x) = 0.\nReceived vector R has too many errors/erasures to correct.");
        return -1;
    }
    else if (v_i[v_i.length - 1] == 0)
    {
        error("Decoding failed: v_i(0) = 0.\nReceived vector R has too many errors/erasures to correct.");
        return -1;
    }
    
    qr = polydiv(v_i, [v_i[v_i.length - 1]]);
    var sigma_1x = qr[0];
    var sigma_1x_len = sigma_1x.length;
    var deg_sigma_1x = sigma_1x_len - 1;
    if (deg_sigma_1x < 0) deg_sigma_1x = 0;
    pl("\nsigma_1(x) = v_i(x)/v_i(0)");
    pl("           = ["+sigma_1x+"]");
    
    qr = polydiv(r_i, [v_i[v_i.length - 1]]);
    var omegax = qr[0];
    var omegax_len = omegax.length;
    var deg_omegax = omegax_len - 1;
    if (deg_omegax < 0) deg_omegax = 0;
    pl("\nomega(x)   = r_i(x)/v_i(0)");
    pl("           = ["+omegax+"]");
    
    var sigmax = polymul(sigma_0x, sigma_1x);
    var sigmax_len = sigmax.length;
    var deg_sigmax = sigmax_len - 1;
    if (deg_sigmax < 0) deg_sigmax = 0;
    pl("\nsigma(x)   = sigma_0(x) * sigma_1(x)");
    pl("           = ["+sigmax+"]");
            
    if (deg_omegax >= (e_0 + deg_sigma_1x))
    {
        error("Decoding failed: deg[omega(x)] >= e_0 + deg[sigma_1(x)].\nReceived vector R has too many errors/erasures to correct.");
        return -1;
    }
    
    // compute *formal* derivative sigma'(x)
    var dsigmax = [];
    
    for (var i = 0; i < sigmax_len - 1; i++) // start with highest power
    {
        var dsigmax_i = 0;
        
        for (var j = 0; j < sigmax_len - 1 - i; j++)
        {
           dsigmax_i = add(dsigmax_i, sigmax[i]); 
        }
        
        dsigmax.push(dsigmax_i);
    }
    
    dsigmax = trimpoly(dsigmax);
    var dsigmax_len = dsigmax.length;
    
    pl("\nFormal derivative of sigma(x):");
    pl("  sigma(x)  = ["+sigmax+"]");
    pl("  dsigma(x) = ["+dsigmax+"]");
    
    // Time-domain completion:
    pl("\nTime-domain completion:");
    var E = [];  // error pattern vector
    var CC = []; // corrected codeword C*
    var count = 0; // number of roots of sigma(x)
    var e_01 = 0; // total number of errors/erasures
    var E_i;
    var sigma_val;
    var omega_val;
    var dsigma_val;
    
    for (var i = 0; i < N; i++)
    {   
        pl("\ni = "+i+":");
        
        sigma_val = 0;
        for (var k = 0; k < sigmax_len; k++)
        {
            sigma_val = add(sigma_val, mul(sigmax[k], pwr(-i * (sigmax_len - 1 - k))));
        }
        pl("  sigma(alpha^-i)  = "+sigma_val);
        
        if (sigma_val == 0)
        {           
            omega_val = 0;
            for (var k = 0; k < omegax_len; k++)
            {
                omega_val = add(omega_val, mul(omegax[k], pwr(-i * (omegax_len - 1 - k))));
            }
            pl("  omega(alpha^-i)  = "+omega_val);
    
            dsigma_val = 0;
            for (var k = 0; k < dsigmax_len; k++)
            {
                dsigma_val = add(dsigma_val, mul(dsigmax[k], pwr(-i * (dsigmax_len - 1 - k))));
            }
            pl("  dsigma(alpha^-i) = "+dsigma_val);
        
            // check if alpha^-i is a root of sigma(x) with multiplicity > 1
            if (dsigma_val == 0)
            {
                error("Decoding failed: alpha^-i is a root of sigma(x) with multiplicity > 1.\nReceived vector R has too many errors/erasures to correct.");
                return -1;
            }
            
            E_i = div(omega_val, dsigma_val);
            
            count ++;
        }   
        else
        {   
            E_i = 0;
    
        }
        
        if (oldR[i] == Q || (E_i != 0))
        {
            // this position i is an erasure or an error position
            e_01 = e_01 + 1;
        }
        
        CC_i = add(R[i], E_i);
        pl("  R("+R[i]+") + E("+E_i+") = C*("+CC_i+")");
        
        E.push(E_i);
        CC.push(CC_i);
    }
    
    
    if (count != deg_sigmax)
    {
        error("Decoding failed: Incorrect deg[sigma(x)]; Inconsistent number of errors/erasures.\nReceived vector R has too many errors/erasures to correct.");
        return -1;
    }
    
    var e_1 = e_01 - e_0; // number of errors
    pl("\nNumber of erasures:");
    pl("  e_0 = "+e_0);
    pl("Number of errors:");
    pl("  e_1 = "+e_1);
    pl("Received vector:");
    pl("  R = [R0 ...  Rn-1]");
    pl("    = ["+oldR+"]");
    pl("Updated received vector:");
    pl("  R = [R0 ...  Rn-1]");
    pl("    = ["+R+"]");
    pl("Error pattern vector:");
    pl("  E = [E0 ...  En-1]");
    pl("    = ["+E+"]");
    pl("Corrected codeword:");
    pl("  C*= [C*0 ... C*n-1]");
    pl("    = ["+CC+"]");
    
    if ((e_0 + 2*e_1) > (N-K))
    {
        error("Decoding failed: Number of erasures and errors do not satisfy e0 + 2*e1 <= r.\nReceived vector R has too many errors/erasures to correct.");
        return -1;
    }
    
    // Check validity of corrected codeword, by computing C*(x)/g(x)
    var CCx = CC.concat().reverse();
    
    // compute generator poly g(x) = PROD{i=1:r} (x - alpha^i)
    var gx = [1];
    for (var i = 1; i <= (N-K); i++)
    {
       gx = polymul(gx, [1, pwr(i)]);    
    }
    pl("\nGenerator poly:");
    pl("  g(x) = [gr ... g2 g1 g0]");
    pl("       = ["+gx+"]");
    
    qr = polydiv(CCx, gx);
    var qx = qr[0];
    var rx = qr[1];
    pl("\nC*(x) / g(x) = ["+qx+"] R ["+rx+"]");
    
    if (rx.length == 0)
    {
        pl("Decoding successful: Corrected codeword is a valid codeword.");
    }
    else    
    {
        error("Decoding failed: Corrected codeword is NOT a valid codeword; Generator poly does not divide the corrected codeword poly.\nReceived vector R has too many errors/erasures to correct.");
        return -1;
    }
    
    // prepare output
    out = "";
    
    for (var i = 0; i < N; i++)
    {
        out = out.concat(chars.charAt(CC[i]));
    }

    pl("\nDecode(\""+input+"\") = \""+out+"\"");
    return out;
}


function enc(input_)
{
    // Perform Reed-Solomon encoding by using the decoder with r erasures
    // Input in = [C0 C1 C2 ... Ck-1], i.e. the information vector
    // (first k symbols of the codeword)
    
    // In the following code, we represent polynomials as:
    //   Rx = [Rn-1 Rn-2 ... R2 R1 R0], i.e. highest power first
    // On the other hand, we denote plain coefficients alone as:
    //   R  = [R0 R1 R2 ... Rn-2 Rn-1], i.e. highest power last
    
    var input = trimstring(input_).toUpperCase();
    
    pl("Encode(\""+input+"\"):");
    
    // Class Project (31,15) RS Code
    var I = [];
    
    for (var i = 0; i < input.length; i++)
    {
        var index = chars.indexOf(input.charAt(i));
        if ((index < 0) || (index > 31))
        {
            error("Invalid input; Elements must be in GF(32) = {A,B,...,Z,1,...,6}.");
            return;
        }
        I.push(index);
    }
        
    // Now, information vector I = [C0 C1 C2 ... Ck-1]
    if (I.length != K)
    {
        error("Input must contain "+K+" symbols; this has "+I.length+" symbols.");
        return;
    }

    pl("\nInformation vector:");
    pl("  I = [C0 C1 C2 ... Ck-1]");
    pl("    = ["+I+"]\n");
    
    var R = "";
    
    for (var i = 0; i < K; i++)
    {
        R = R.concat(chars.charAt(I[i]));
    }
    
    // pad r erasures after I
    for (var i = 0; i < (N-K); i++)
    {
        R = R.concat('?'); // erasure
    }
    
    var out = dec(R);
    
    pl("\nEncode(\""+input+"\") = \""+out+"\"");
    return out;
}


function encodeI(sourceElem)
{   
    input_I = document.getElementById(sourceElem).value;

    document.getElementById("c").style.backgroundColor ="#FF9933";
    document.getElementById("c").value = "ENCODING...";
    
    clearOutput();
    
    var C = enc(input_I);
    showOutput();
    
    if (C == undefined)
    {
        document.getElementById("c").style.backgroundColor = "#FFFFFF";
        document.getElementById("c").value = "";
    }
    else if (C == -1)
    {
        document.getElementById("c").style.backgroundColor ="#FF4500";
        document.getElementById("c").value = "UNABLE TO ENCODE I!";
    }
    else
    {
        document.getElementById("c").style.backgroundColor ="#99FF99";
        document.getElementById("c").value = C;
    }
}

function decodeR()
{
    input_R = document.getElementById("r").value;

    document.getElementById("cc").style.backgroundColor ="#FF9933";
    document.getElementById("cc").value = "DECODING...";

    clearOutput();
    
    var CC = dec(input_R);
    showOutput();
    
    if (CC == undefined)
    {
        document.getElementById("cc").style.backgroundColor = "#FFFFFF";
        document.getElementById("cc").value = "";
    }
    else if (CC == -1)
    {
        document.getElementById("cc").style.backgroundColor ="#FF4500";
        document.getElementById("cc").value = "UNABLE TO DECODE R!";
    }
    else
    {
        document.getElementById("cc").style.backgroundColor ="#99FF99";
        document.getElementById("cc").value = CC;
    }
}


function changeOtfMode()
{
    if (document.getElementById("otf").checked == true)
    {
        otfmode = true;
    }
    else
    {
        otfmode = false;
    }   
}

function changeVerboseMode()
{
    if (document.getElementById("verbose").checked == true)
    {
        verbosemode = true;
    }
    else
    {
        verbosemode = false;
    }       
}

function updatedI()
{
    if (otfmode == false) return; // manual mode
    
    var input_I_ = document.getElementById("i").value;
    
    if (input_I == input_I_) return; // no change in user input
    
    input_I = input_I_; 
    encodeI();
}

function updatedR()
{
    if (otfmode == false) return; // manual mode
    
    var input_R_ = document.getElementById("r").value;
    
    if (input_R == input_R_) return; // no change in user input
    
    input_R = input_R_;
    decodeR();
}

function copyC2R()
{
    document.getElementById("r").value = document.getElementById("c").value;
}
