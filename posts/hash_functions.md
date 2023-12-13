This aims to give a working understanding of what hash functions are and what their uses are. I won't go into the actual math, since I'm unqualified to talk about that, and I probably wouldn't understand it anyways. We're also not going to talk about hash tables since my understanding of them is very limited.

A hash function is basically an algorithmn that takes data as an input, and outputs something with these important properties:

- **Irreversible**: Given the output of a hash function, it should not be possible to (algorithmically) find the input
- **Uniformity**: Inputs should have evenly distributed outputs - meaning, if you split the possible ranges of outputs into *n* buckets, and randomly hashed stuff a gazillion times, all the buckets should have a roughly equal amount of outputs in them. This also means that two similar but not identical inputs will likely have completely different outputs
- **Deterministic**: The same two inputs will always give the same output (well, that's more of a characteristic of functions in general)
- **Unique**: No two inputs should give the same output
- **Fixed length**: An input of arbitary length will be converted into an output of fixed length

Now wait a second - **the last two properties seem to contradict each other**. How can no two inputs give the same output if an infinite number of inputs become a finite number of inputs? Well, hash functions are not immune to the rules of logic, so it isn't actually true that no two inputs give the same output. However, *a good hash function should make it practically impossible for anyone to find two inputs that result in the same output* (called a collision). If a collision can be found, the hash function would be unsafe to use for most usecases.

# Usecases?

Hashing has a huuuuggggeeeee amount of applications, but I'll describe a few.

## Checksums

What if your best friend, the President of the United States, wants to send you an important large file (say, a video of Colonel Sanders making fried chicken), but can't physically give it to you via a USB stick or hard drive? Your friend might upload the file to a file sharing service, and share the link with you. But how do you know the file hasn't been tampered with? The file sharing service might be run by someone who has an interest in preventing you from eating some finger licking good chicken, who'll replace the real video with a fake video with Colonel Sanders putting toxic ingredients into the chicken and undercooking it. To verify the video is genuine, the President could hash the video, and tell you the hash in person (to avoid anyone also tricking you about what the hash is). Once you download the video, you can hash it too. If the hashes match (and the hash function is secure), you can be confident that the video hasn't been messed with. If they don't, you know the video has been modified.

This is possible since hash functions shouldn't have two inputs that result in the same output.

## Passwords

Instead of storing passwords in plaintext, which would result in disaster if the database was hacked, passwords are typically hashed. Since hash functions are supposed to be irreversible, the password remains a secret, but can still be verified - the site can hash the user provided password, and make sure it matches the hash it has on file (since the same input will always get the same output).

### Rainbow Tables and Salting

However, if an attacker gets their hands on a database full of hashed passwords, they can still easily crack many of the passwords with something called a rainbow table. Essentially, attackers can precompute the hashes of millions of likely or known passwords before they even attack. Since two inputs will always have the same output, an attacker with a bunch of stolen hashes can just look for a matching hash in their rainbow table, and figure out what the plaintext password is, even though hash functions are irreversible.

To prevent this, it is highly recommended to append random text to the password (each user should have a unique random text added) before hashing. This is called a salt. As long as that salt is stored, the password verifying process is the same - just add the stored salt before hashing. If this is done, rainbow tables are useless for attackers, since even if the user uses a common password, the random salt makes it so the hash will not be in the precomputed rainbow table. The attacker will have to generate a new rainbow table for every single user/salt, instead of just one for everyone! Salts are usually just stored wherever the hashed passwords are, but if they are kept hidden somewhere else, they are called "peppers".

SALT PASSWORDS!!!

## Digital Signatures

In digital signatures, the hash of the message is usually signed, instead of the actual message, since the hash is guaranteed to be a certain size, which is usually smaller than the actual message, making it much easier to sign.

## Proof-of-Work

Hashes can be a way to impose a cost in energy. Most famously, Bitcoin and many other cryptocurrencies use PoW to reach consensus trustlessly (as long as more than 50% of the computing power isn't controlled by one entity), and some captchas also use PoW as an anti-spam. Taking Bitcoin as an example, it requires adding random bytes to the block data, then hashing it, until it the hash starts with *n* number of zeroes, in order for the block to be mined (valid). Basically, it's just making millions of guesses about what random bytes appended to the block data will result in a hash that starts with the correct number of zeroes. Using more powerful computers and more energy results in more guesses in less time, making it more likely to find the right random bytes to add to mine the block. The more zeroes are the hash is required to start with, the more difficult the problem is, and the more energy it will take to generate the work.

## Key Derivation

Hashing is also a great way to derive cryptographic keys. For example, a password would usually not be able to be an encryption key, since encryption keys are typically a fixed length of bytes long. So, a password can be hashed, turning it into the right length, so it can be used in cryptography.


Hashes are cool.
