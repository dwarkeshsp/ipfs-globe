# IPFS Globe

See how the DHT locates the providers for the CID you specify.

## How to use your local daemon

1. Install [IPFS](https://github.com/ipfs/ipfs).

2. Allow this website to use your daemon.

```console
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin  '["https://ipfs-globe.netlify.app/"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST", "GET"]'
```

3. Start your daemon.

```console
ipfs daemon
```

4. Refresh webpage.
