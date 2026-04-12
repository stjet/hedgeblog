> About a year ago, I wrote a DNS over HTTPS server for an intranet. Recently, I [wrote one](https://github.com/stjet/poc-bns-doh-and-resolver) for BNS (Banano Name System). The code is very messy. Both times, I ran into incredibly frustrating situations that apply more broadly into why I don't really like the World Wide Web. Don't expect this to be too well written, the first half is an explanation of the parts of the DNS protocol that I implemented, and the second half is a rant about how the World Wide Web works.

## DNS? Deep Nautical... Submarines?

Let's get a few definitions out of the way first.

DNS stands for the "Domain Name System". To simplify and omit, when you visit a website, DNS is how your computer knows what server to send requests to. After all, what does a domain name (say, prussiafan.club or www.example.com) mean to a computer? Nothing. Your computer doesn't know what to do with this. So, it asks a DNS server what IP address is behind the domain name. Now, an IP (Internal Protocol) address (four 8-bit numbers separated by dots for IPv4, eg. 127.0.0.1) is something your computer *does* know how to deal with!

This is not the right place to get into the muck of how the internet works, but an IP address is just like a real address ("10 Downing Street"): there is a *lot* of infrastructure and code that makes it very easy for your computer to find where it is. In contrast, with a domain name, some extra effort needs to be spent: you can't send mail to "That place where that [adjective] Margaret Thatcher used to live", you'd have to figure out the address first.

So, a DNS server is basically some computer out there that translates domain names into IP addresses.

DoH stands for "DNS over HTTPS". Normally, DNS requests are sent unencrypted to the DNS server, and so is the response. So, any party in-between them could tamper or read the contents of the message, which would be very bad^tm^. The first concern, tampering, is less of a concern nowadays because HTTPS prevents it (since any tamperers will very probably not be able to get HTTPS certificates for the domain they are pretending to be). The second is very real, and can be used for censorship or sale of data to advertisers. Well, it does need to be noted that it is usually the DNS servers themselves doing the censorship and selling data. DNSSEC allows for signing records, which means any tampering (including by the DNS server itself!) is obvious, but doesn't prevent spying on the DNS messages. Also, it is not very commonly used. DoT (DNS over TLS) encrypts the messages between the client (your computer) and the DNS server, which prevents tampering and spying by anyone in-between. DoH is very similar to DoT, but instead of using the low level TLS protocol, DNS messages are sent using HTTPS to a domain which acts like a DNS server. The advantage is that DoH requests are very hard to censor as they look like any other HTTPS request, while DoT can easily be blocked because they look unique and go to a unique port.

But hey, wait a second! Since DoH requests are sent to a domain name, but DNS is required in order to figure out what server that domain name is... isn't this a chicken and egg problem? Sure, but there is a boring solution. To resolve the DoH domain name, use regular DNS. Now, DoH can be used exclusively. Boring, yes, but it works. This doesn't undermine the security of the whole thing, because as stated earlier, HTTPS means that the client can be confident that it is sending messages to the correct server. We'll come back to this HTTPS stuff later, mostly to complain, but but there will be some explain too.

## Why?

I actually worked on two DoH servers. One was for my intranet, where subdomains of one of my domains would resolve to local IP addresses (either on my home network or on Tailscale), so I could have a more convenient way of accessing my self-hosted services (ie, not having to memorise and type in their IP addresses), that didn't involve exposing my home network to the rest of the scary world.

The second is a DNS server for BNS (Banano Name System). BNS allows infinite, decentralised TLDs, and once a TLD issues a domain, it cannot be revoked by the TLD, and the domain does not need to be renewed. It will never expire. Everything is cryptographically verifiable as it builds on top of the Banano block lattice. DNS records (and other arbitrary metadata) can be encoded on-chain as a IPFS hash, and then the DoH server can resolve it.

## Actually writing the thing

The first hurdle was, of course, to actually write the server - parse the DNS request and give a response. Luckily, this is all well documented in RFC 1035 (which covers the DNS message format) and RFC 8484 (which covers how DNS over HTTPS works). Alright, "well documented" is not entirely accurate, but it is documented *enough*. What was unclear or confusing was clarified with the help of the TCP/IP guide, logging actual requests/responses, and in one case, a random blog post. In my case, I mainly wanted DoH to work for browsers, so there were some parts of the protocol I could ignore. I'll briefly summarise the relevant parts of the format.

### Message format

Both requests ("queries") and responses ("replies") have the same format.

#### The header

All DNS messages start with a 12-byte header (see RFC 1035 Section 4.1.1).

The first part of the header is a 16-bit (2 byte) ID that the request tells the server, and the server copies so when it sends a response to the client, the client knows which message the server is responding to. This is not needed when doing DoH since HTTP can already associate a request with a response. So, the ID will just be all 0s.

The next part of the header is 16 bits (2 bytes) of flags:

```
QR (query: 0, reply: 1), 1 bit
OPCODE (standard: 0), 4 bits (opcode in query is repeated in response)
AA (in response, if authorative answer for hostname), 1 bit
TC (whether message was truncated), 1 bit
RD (in request, then copied in response, where recursion desired), 1 bit
RA (in response, whether recursion available), 1 bit
Z (reserved), 3 bits
RCODE (response code, NOERROR: 0, FORM(at)ERR: 1, SERVFAIL: 2, NXDOMAIN: 3, Not Implemented: 4, Refused: 5), 4 bits
```

`OPCODE` also has `1` (inverse query) and `2` (server status request). Our server won't need to worry about that. At least, afaik browsers don't do inverse queries or ask for server status, so we'll leave that unimplemented. We can also ignore the truncation, all of our response records will be short enough that it won't be a concern.

So, a normal query will have the QR flag set to `0`. In our reply, we can copy the queries' flags, changing the QR to `1`, changing the RA to `0` (we *could* implement recursion for CNAMEs but if we indicate we don't support it, the browser will do it for us, saving us a lot of work), then finally changing the RCODE depending on what we find. Typically, our RCODE will either be NOERROR (if we found the intranet domain) or NXDOMAIN (if the intranet domain doesn't exist).

The final part of the header are four 16-bit integers (so 64 bits, or 8 bytes) that, in order, tell us the question count, resource record count in the answer section, name server resource record count in the authority section, and the resource record count in the additional records section.

Browsers seem to send queries with only one question, which saves us yet more work. Queries will have a count of 0 for the rest of the counts as queries are requesting records, not sending them to the server. You might imagine that the reply would have 0 questions, since it is a reply, but we actually need to copy the question in the reply. So the reply with a question count of 1. I only care about responding to CNAME (other domains) or A (IPv4 addresses) record requests, and (assuming no CNAME recursion) those will only have 1 per domain/subdomain, so the answer section resource record count will usually be 1. That is, unless the intranet domain doesn't exist, in which case RCODE in the previous section of the header will be NXDOMAIN as mentioned, and the answer section count will be 0 for obvious reasons. For our intranet domains, they do not have nameservers (DNS servers which act as the final authority on what records a domain has), so the authority section count will be 0. I'm not totally sure what the use case of the additional records section would be. Since my browser only sends requests for A or AAAA (IPv6) records for domains, I thought the additional record section might be where the CNAME is supposed to be (a domain/subdomain can't have both a CNAME record and an A/AAAA record). Alas, that doesn't seem to be the case. Even if an A record is requested, the CNAME should be in the answer section (and if the server supports CNAME recursion, then it will be followed by A/AAAA/CNAME records of the domain the CNAME is pointing at). So, in our server's reply, the additional records section count will also be 0.

Going a bit off-topic from what this section is supposed to be, what is CNAME record anyways? A/AAAA records tell the client what IPv4/6 address the domain name points at, and if you remember, IP addresses are what computers want (just like how plants crave electrolytes). A CNAME record points to *another* domain, which hopefully has an A/AAAA record. Or, it could have another CNAME record, that the resolver would have to keep following... if the CNAME records point at each other, that would create an infinite loop! Luckily, those are easy to detect and won't crash modern DNS servers. We can avoid all this by setting the RA flag to `0` and having the browser handle that, as previously mentioned.

#### Questions

This is covered in RFC 1035's Section 4.1.2. To resummarise, questions are composed of three parts, a QNAME (variable length), QTYPE (2 bytes), and QCLASS (2 bytes). The QNAME is a little complicated, so we'll get back to that later. The QTYPE is the type of record being requested (eg `1` for A records, `5` for CNAME records). QCLASS is even simpler, it will always be `1` for IN (internet). The other option for QTYPE is for [Chaosnet](https://en.wikipedia.org/wiki/Chaosnet), in case you were curious.

So, let's tackle QNAMEs. QNAMEs are domain names encoded in a way that makes it easier for the parser to know when it ends. They are made out of components called labels, which are also used in resource records.

The easiest way to explain is to show. Consider a domain name `chat.example.org`. It is composed of three parts, `chat`, `example`, and `org`, right? Well actually technically, it is composed of four parts, since `chat.example.org` is really a convenient shortening of `chat.example.org.`. These parts are actually called "zones" (well, a little more complicated than that but it really doesn't matter). The reason why there is an extra dot is because that is the root zone, which ICANN manages. ICANN is the terrible organisation that decides what TLDs (top level domains, think `.com`, `.org`, `.ninja`, `.baidu`) exist, and what company/non-profit gets to administer them. ccTLDs (country code TLDs like `.uk`, `.jp`, `.de`) are supposed to be managed by whoever the nations appoint, though since ICANN controls the root zone in practice they *could* take over. Anyways, each zone is a label.

A label starts with one byte stating the length of the zone name, and then zone name in bytes. So for example, `chat.example.org` would become `4chat7example3org0`. Imagine the letters are in their ASCII byte representation. The final 0 is the because the root zone has no name. This also means we know when the domain name is over if the length is 0.

Simple, right? Yup. Except, wait! Terrible news, there's more. As the authors of the RFCs were concerned with compression, they wanted to avoid repeating too much. Imagine we return a hundred records for `chat.example.org`, `4chat7example3org0` would be repeated an awful lot. If the first two bits of one of the lengths is `11` (I neglected to mention earlier the length must start with the bits 00, and so be less than 6 bits, or 64), then that label is a pointer to a domain name encoded earlier. The remaining 6 bis is the offset to the domain name the pointer is pointing at. The good news is that pointers are optional, so we won't bother with them in the resource records in our replies. But we do need to know how to parse them from the queries.

#### Answer Section

So, assuming whatever hostname the requester is asking for information on exists, we'll return the answer in the... answer section. Specifically as a resource record, whose format is specified in Section 4.1.3. Resource records are composed of six parts: NAME, TYPE, CLASS, TTL, RDLENGTH, RDATA.

NAME is the same as the QNAMEs in the question section. So nothing new here. TYPE is technically a subset of the QTYPE in the question section, but still uses the same integers to represent A records, CNAME records, etc, so nothing new here either. CLASS is the same QCLASS, it should be `1` for IN (Internet).

TTL means "Time to Live", or the time, in seconds, that the client should cache the DNS response. It is 32 bits (4 bytes). If the DNS record changes frequently, it's a good idea to set this to a small number. 10 minutes? 30 minutes? An hour? You choose. If it is unlikely to change, setting it to a few hours or a day should (*in theory*) reduce the load on the DNS server.

RDLENGTH is 8 bits (2 bytes) which inform the reader about the length, in bytes, of the RDATA section. For example, with A records, which are IPv4 addresses, RDLENGTH will always be 4. With CNAME records, RDLENGTH will vary, since domain names can be of varying lengths. This is needed because otherwise clients would have difficulty figuring out when a resource record starts or ends, if there are multiple.

RDATA is the actual data, and is variable length. Again, if the record we are returning is an A record, RDATA will be four bytes long and contain whatever the IPv4 address is. If the record is a CNAME record, RDATA will be domain name, in the same format as NAME/QNAME (the labels, at least; I'm not totally sure if the pointers are allowed, though I would assume so).

### Are we done?

So, wonderful. We parse the query message, see what domain it is requesting, if it is a intranet domain, we then copy the query message, change it a bit, and append our CNAME/A record answer.

But I probably want to visit normal websites too. This current setup isn't aware of say, wikipedia.org's existence; that's not an intranet domain! So, our poor server would have to query the root domain to find the DNS server for `.org`, then query that server for `wikipedia.org`'s nameservers, then query those namesevers for the actual record. Sounds like an awful lot of work.... which we can avoid entirely! We'll just route queries for non-intranet TLDs/domains to another DoH service, like NextDNS, Cloudflare, or Mullvad's. They'll handle everything, and we can just proxy whatever they return.

Ok, now are we done?

## Well...

### HTTPS/CAs

For intranets, there are two possible approaches.

One is to make the intranet be subdomains of a "real" domain. If you own `example.com`, intranet sites could use subdomains of that site. Certificate authorities (CAs, to be explained in a few paragraphs), will happily issue you a HTTPS certificate, and you can keep the intranet intra since DNS records will only exist for those using your DNS server.

The other is to make up a TLD that isn't already used. Maybe `.internal`, `.intranet`. Or something creative. Doesn't matter. This approach is a path of pain, at least when it comes to HTTPS.

To understand why this is such a pain in the ass, how HTTPS works must be explained first. HTTPS encrypts the connection between the the client (say, a browser), and the server. Other than that, it is just normal HTTP. That's common knowledge. But how does it do that?

> To be more specific, HTTPS is just HTTP on TLS (Transport Layer Security), a more generalised way to encrypt connections, including connections that aren't HTTP.

Public-private key cryptography, that's how. If you randomly generate a private key (just think of it as a really big number), with some fancy math, a public key (another really big number) can be generated. Anyone who knows the public key can use it to encrypt a message, and then only the holder of the private key will be able to decrypt it. However, public-private key cryptographically is slow, so it is often just used initially to exchange a symmetric key to do symmetric cryptography, which is much faster.

So, great, if the browser knows the public key of the website, it can communicate with it securely. But how does it know? It needs to ask some entity it trusts for the public key. After all, if it uses the wrong public key, perhaps one of a hacker, the encryption is useless. But needing to fetch the public key from some source before sending any requests to the site would be quite time consuming, and raise serious privacy concerns (the public key directory would be able to tell what websites people are visiting). So, in HTTPS, entities called Certificate Authorities (CAs) sign a certificate (the website's public key and some other information), vouching for its legitimacy. The website then sends that signed certificate to the client. Clients have a CA store, or a list of CAs that it trusts. It can then verify that the certificate was signed by a CA that it trusts. **That it trusts.**

But can we trust CAs? Most of them have good track records. And there are various ways in which CAs are gradually forced to become more transparent. But still, HTTPS requires that we involve, and trust, yet another third party. CAs could be hacked. Or pressured by governments. Or just plain malicious. A bad CA means HTTPS is useless. Worse than useless, because the connection is presented as secure and with the server when that isn't true, giving a false sense of security. And there are about 150 of them that need to be trusted! The situation is gradually improving, and the especially paranoid can do things like certificate pinning, but the entire system has fundamental flaws.

Most CAs are businesses, and charge for certificates. Charging money for HTTPS? Well, that's bad. Luckily, there are non-profit organisations that issue certificates for free, like Let's Encrypt.

Still, CAs mean additional trust, additional risk. And CAs will obviously not issue certificates for non-existent domains, which makes it quite painful to run an intranet with HTTPS. Intranet operators will likely need to create their own internal CA. Luckily, since intranet CAs don't need to be (and won't be) added to certificate stores by default, making a CA is as simple as generating some cryptographic keys. No vetting or whatnot needed. However, *every* client that wants to use HTTPS on the intranet will need to add that CA to their certificate stores. This is a huge pain, and possibly dangerous (if "Name Constraints" aren't used).

What would an alternative be? DANE, that's what! DANE has the public key in the DNS records. We have to trust the DNS records anyways, because those are what tell us the IP address of the server(s) behind the domain. If that is a lie, the HTTPS certificate being invalid doesn't matter anyways.

### Self-hosting

For a website to work, it needs to have a A (IPv4), AAAA (IPv6), or CNAME (another domain name) record. CNAME records need to eventually point to a A or AAAA record. Now, many people probably have a IPv4 or IPv6 address from their ISP. So all that needs to be done is open some ports, right? Well, ISP will usually change it around, so the DNS record will quickly become invalid. There are automated ways to change the DNS record when your IP changes. You could also get a static IP, probably by paying an extra fee.

Great! Except... no. There is a huge IPv4 address shortage (only 4 billion of them, after all), so many people may be behind CGNAT (sharing IPs with many other people). Or in any other situation where they don't have their own IP and can't open/forward ports. The IPv6 situation is much better, but it isn't an option everywhere. Plus, IPv6 is famously in the midst of a multi-decade botched adoption, so many clients just don't support IPv6. Even assuming that isn't a problem, and ignoring any monetary costs, there are naturally many, many, security concerns related to allowing anyone to send stuff to your ports. Additionally, anyone could figure out the general location of your residence with your IP. The authorities or anyone resourceful could figure out the exact address, name, etc.

The usual solution to this is to have Cloudflare manage the DNS and proxy requests to you. They will do this for free. It's quite nice, but ultimately this is something that depends on the generosity of Cloudflare, and cannot be counted on forever. Plus, it is quite unhealthy for large swaths of the internet to depend on just Cloudflare, and letting Cloudflare snoop on all the traffic isn't great. Even encrypted traffic has valuable metadata. Cloudflare also provides a service for those who can't (or don't want to) open ports, called Cloudflare Tunnel (thank you, Cloudflare). But again, this depends on the generosity of Cloudflare, allows them to snoop, and understandably has limitations if doing anything out of the ordinary. For example, if I wanted to host a web server at the domain prussia.ban (`.ban` not being a "real" [ICANN] TLD), publically accessible to anyone who uses my DoH server, I'd need a IPv4/IPv6 address, there is just no way around it. Cloudflare won't work for these non-existent domains, understandably. So, to self-host (or host on a VPS without paying for a IPv4 address), the only free choice is basically to use Cloudflare.

For an intranet, where everyone is on the same network, this isn't too bad of an issue, since people who are in control of the router can just use the internal 192.168.\* IPs. No need to worry about security/privacy, or pay for a IPv4/IPv6 address. Oh, except Firefox refuses to accept 192.168.\* A records, probably for security reasons? 127.0.0.1 does seem to work, though... So it would have to be painfully proxied through 127.0.0.1. Argh!

This is terrible! Terrible! Webhosting should be accessible to anyone with an internet connection and some sort of computing device, without being forced to rely on the generosity of some mega-corp.

It's hard to argue making self-hosting easier and more accessible would be a bad thing, but perhaps this is just the way the world works. No one's entitled to a free lunch (well, so goes the saying). People should just shell out some money for an IPv4 address, right?

Wrong! Wrong! Wrong! This isn't how the world works. There is a free lunch. Tor onionsites (aka hidden services) does everything the World Wide Web cannot. No ports need to be opened. It could run behind CGNAT, or McDonald's wifi. Privacy is preserved, and the identity of the server is secret to clients (and the identity of the clients is secret to the server, but that's orthogonal for self-hosting). An encrypted connection is provided without needing to trust CAs. There are middlemen, but they can't peep and are interchangeable. How Tor onionsites work is out-of-scope of this post (but easily searchable on-line), but the point is, everyone I dream of is not only possible, but has already been done. Tor is the self-hosters dream. Tor is what the internet should be. I wake in the morning, furious that the World Wide Web works the way it does.
