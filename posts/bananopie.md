Bananopie was written with the aim of being the Python equivalent of Banano.js (but better :)) and furthering my understanding of the Nano/Banano protocol. I learned quite a bit about how blocks were constructed and whatnot. Very fun, would recommend.

Anyways, I think it's acheived that goal, and hopefully went a bit above and beyond in simplicity and powerfulness (it has some useful functions that Banano.js does not, like `send_all` and the old message signing, as well as local work generation).

The only two frustrations I had while writing Bananopie was not knowing whether certain things were big-endian or little-endian, since the Nano docs don't specify (I just tested against the output of Banano.js or wallets), and also dealing with Python's decimal precision fuckery.

You can see the syntax and documentation on [Github](https://github.com/jetstream0/bananopie) so I won't bother with that.

What I *do* want to talk about is how blocks are constructed (exciting, I know).

Remember, Banano/Nano is a DAG, not a blockchain. In Bitcoin, blocks contain multiple transactions are in one long chain. In Nano, each account (address), has it's own chain of blocks, where each transaction is one block. All those chains are connected to each other through sends and receive blocks.

In general, Nano blocks can be classified into three subtypes: send, receive, and change Representative, each which does exactly what you would expect. There is no restriction that only change blocks can change representatives - send and receive blocks can also change representatives.

All blocks have the following:

- type: Always "state"
- account: The address that is sending the block
- previous: The hash of the previous block of the account, or "0000000000000000000000000000000000000000000000000000000000000000" if the account is unopened (has never done any transactions)
- representative: The representative of the account that is sending the block
- balance: The balance of the account that is the sending the block
- link: Depends on the block type

## Send Block

A send block is one where the "balance" decreases. The "link" is the public key of the recipient.

```python
class Wallet:
  ...
  def send(self, to: str, amount: str, work = False, previous = None):
    amount = whole_to_raw(amount)
    address_sender = self.get_address()
    private_key_sender = get_private_key_from_seed(self.seed, self.index)
    #public_key_sender = get_public_key_from_private_key(get_private_key_from_seed(self.seed, self.index))
    public_key_receiver = get_public_key_from_address(to)
    info = self.get_account_info()
    if not previous:
      previous = info["frontier"]
    representative = info["representative"]
    before_balance = info["balance"]
    #height not actually needed
    new_balance = int(int(before_balance)-amount)
    if new_balance < 0:
      raise ValueError(f"Insufficient funds to send. Cannot send more than balance (before balance {str(before_balance)} less than send amount {str(amount)})")
    block = {
      "type": "state",
      "account": address_sender,
      "previous": previous,
      "representative": representative,
      "balance": str(new_balance),
      #link in this case is public key of account to send to
      "link": public_key_receiver,
      "link_as_account": to
    }
    block_hash = hash_block(block)
    signature = sign(private_key_sender, block_hash)
    block["signature"] = signature
    if work:
      block["work"] = work
    return self.send_process(block, "send")
  ...
```

## Receive Block

A receive block is one where the "balance" increases. The "link" is the hash of the block to receive.

```python
class Wallet:
  ...
  def receive_specific(self, hash: str, work = False, previous = None):
    #no need to check as opened, I think?
    #get block info of receiving
    block_info = self.rpc.get_block_info(hash)
    amount = int(block_info["amount"])
    address_sender = self.get_address()
    private_key_receiver = get_private_key_from_seed(self.seed, self.index)
    #public_key_sender = get_public_key_from_private_key(get_private_key_from_seed(self.seed, self.index))
    #public_key_sender = get_public_key_from_address(block_info["block_account"])
    #these are the defaults, if the account is unopened
    before_balance = 0
    representative = address_sender
    if not previous:
      try:
        #if account is opened
        info = self.get_account_info()
        previous = info["frontier"]
        representative = info["representative"]
        before_balance = info["balance"]
      except Exception as e:
        #probably, unopened account
        previous = "0000000000000000000000000000000000000000000000000000000000000000"
    #height not actually needed
    block = {
      "type": "state",
      "account": address_sender,
      "previous": previous,
      "representative": representative,
      "balance": str(int(before_balance)+amount),
      #link in this case is hash of send
      "link": hash
    }
    block_hash = hash_block(block)
    signature = sign(private_key_receiver, block_hash)
    block["signature"] = signature
    if work:
      block["work"] = work
    return self.send_process(block, "receive")
  ...
```

## Change Representative Block

A change block is one where the "balance" does not change, but the "representative" does. In this case, "link" is just "0000000000000000000000000000000000000000000000000000000000000000".

```python
class Wallet:
  ...
  def change_rep(self, new_representative, work = False, previous = None):
    address_self = self.get_address()
    private_key_self = get_private_key_from_seed(self.seed, self.index)
    #public_key_sender = get_public_key_from_private_key(get_private_key_from_seed(self.seed, self.index))
    #account must be opened to do a change rep
    info = self.get_account_info()
    if not previous:
      previous = info["frontier"]
    before_balance = info["balance"]
    block = {
      "type": "state",
      "account": address_self,
      "previous": previous,
      "representative": new_representative,
      "balance": before_balance,
      #link in this case is 0
      "link": "0000000000000000000000000000000000000000000000000000000000000000"
    }
    block_hash = hash_block(block)
    signature = sign(private_key_self, block_hash)
    block["signature"] = signature
    if work:
      block["work"] = work
    return self.send_process(block, "change")
  ...
```

## Hashing Blocks

Before being signed, the block must be hashed. The resulting block hash is what you usually seen used to identify blocks (eg, to find a block on the block explorer, you would give it the block hash).

Let's look at Bananopie's `hash_block` function:

```python
def hash_block(block) -> str:
  blake_obj = blake2b(digest_size=32)
  blake_obj.update(hex_to_bytes(PREAMBLE))
  blake_obj.update(hex_to_bytes(get_public_key_from_address(block["account"])))
  blake_obj.update(hex_to_bytes(block["previous"]))
  blake_obj.update(hex_to_bytes(get_public_key_from_address(block["representative"])))
  padded_balance = hex(int(block["balance"])).replace("0x","")
  while len(padded_balance) < 32:
    padded_balance = '0' + padded_balance
  blake_obj.update(hex_to_bytes(padded_balance))
  blake_obj.update(hex_to_bytes(block["link"]))
  #return hash
  return bytes_to_hex(blake_obj.digest())
```

`digest_size=32` means that the blake2b hash will have a 32 byte output, which makes sense, since block hashes are supposed to be 32 bytes.

The input for the hash is the preamble, the public key of the "account" field of the block, the "previous" of the block (hash of the previous block), the public key of the "representative" field of the block (the new/unchanged representative of the address), the "balance" field of the block, and the "link" field of the block, all concatenated.

For both Banano and Nano, the `PREAMBLE` in hexadecimal is `0000000000000000000000000000000000000000000000000000000000000006` (0x6). You see, Nano used to have different block types, each with it's own preamble: send (0x2), receive (0x3), open (0x4), change (0x5). Now, **everything is a state block, so all preambles are 0x6**.

A preamble could also be used to make sure Nano blocks can't be broadcasted to a Nano fork, and vice versa (prevent replay attacks). But as mentioned, Banano and Nano actually use the same preamble, so this actually isn't the case.

## Signing Blocks

The block hash must be cryptographically signed of the address to be valid. This proves that the address meant to create the block. If a block signature was not required, people could spend your funds without even having your private key (bad)!

The cryptography is complicated, but we don't need to worry about that. At a high level, signing blocks is very simple. You just need the private key and block hash, then boom, you got a signature:

```python
def sign(private_key: str, hash: str) -> str:
  #ed25519_blake2b verify
  signing_key = ed25519_blake2b.SigningKey(hex_to_bytes(private_key))
  signature = bytes_to_hex(signing_key.sign(hex_to_bytes(hash)))
  return signature
```

## Generating Work

The Kalium public node generates nicely generates the block work for you, but not all nodes do.

In case the node being used doesn't generate block work, we'll need to do it ourselves. Bananopie has two work generation methods, `gen_work_random` and `gen_work_deterministic`. `gen_work_deterministic` is the default, but `gen_work_random` is easier to explain and basically the same as the deterministic way, so let's look at that:

```python
def gen_work_random(hash: str, threshold: str) -> str:
  #generate work with random.randbytes()
  while True:
    #work is 64 bit (8 byte) nonce
    #only generate 3 random bytes, first 5 are 0s. I see kalium do that I think, so I dunno if its more efficient but I copied that
    #nonce = hex_to_bytes("0000000000"+bytes_to_hex(random.randbytes(3)))
    nonce = random.randbytes(8)
    #when blake2b hashed with the hash, should be larger than the threshold
    blake_obj = blake2b(digest_size=8)
    blake_obj.update(nonce)
    blake_obj.update(hex_to_bytes(hash))
    #since hex_to_bytes returns big endian, for BANANO_WORK, after we convert to hex, we convert to bytes with big endian
    if int.from_bytes(blake_obj.digest(), byteorder="little") > int.from_bytes(hex_to_bytes(threshold), byteorder="big"):
      #return as big endian
      return bytes_to_hex(bytearray.fromhex(bytes_to_hex(nonce))[::-1])
```

The block work is just 8 bytes that, when added to the block hash, and hashed again, is larger than the threshold. In Banano, the threshold is `FFFFFE0000000000` (18446741874686296064). In Nano, the threshold is larger, so Nano work takes longer to generate.

Basically, we generate random bytes until the hash of the block hash plus the random bytes is greater than the threshold (18446741874686296064). If it is, we found valid work for the block. Hurray!

## Broadcasting Blocks

Nothing fancy here. We just do a ["process"](https://docs.nano.org/commands/rpc-protocol/#process) RPC call to the node, which will broadcast the block:

```python
class Wallet:
  ...
  def send_process(self, block, subtype: str):
    payload = {
      "action": "process",
      "subtype": subtype,
      "json_block": "true",
      "block": block
    }
    if "work" not in block:
      if self.try_work:
        #if opening block, there is no previous, so use public key as hash instead
        if block["previous"] == "0000000000000000000000000000000000000000000000000000000000000000":
          block["work"] = gen_work(self.get_public_key())
        else:
          block["work"] = gen_work(block["previous"])
      else:
        payload["do_work"] = True
    return self.rpc.call(payload)
  ...

class RPC:
  ...
  #send rpc calls
  def call(self, payload):
    headers = {}
    #add auth header, if exists
    if self.auth:
      headers['Authorization'] = self.auth
    resp = requests.post(self.rpc_url, json=payload, headers=headers)
    #40x or 50x error codes returned, then there is a failure
    if resp.status_code >= 400:
      raise Exception("Request failed with status code "+str(resp.status_code))
    resp = resp.json()
    if "error" in resp:
      raise Exception("Node response: "+resp["error"])
    return resp
  ...
```
