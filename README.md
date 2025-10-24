# lev2

A [CLI](https://en.wikipedia.org/wiki/Command-line_interface) for managing [`LevelDB`](http://leveldb.org/) instances.

This repo is a **fork** of [`lev`](https://github.com/hxoht/lev), originally to make [those changes](https://github.com/hxoht/lev/pull/59) available from NPM

[![NPM](https://nodei.co/npm/lev2.png?stars&downloads&downloadRank)](https://npmjs.com/package/lev2/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/badge/node-%3E=%20v6.4.0-brightgreen.svg)](http://nodejs.org)

## Features
* [CLI](#cli)
  * providing many basic tools to read and write on a leveldb from the command line
  * import / export, and delete by range
* [REPL](#repl): :warning: This feature was unmaintained and removed in `v8.0.0`. If you need it, use an earlier version or the original `lev` package.

## Summary

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Installation](#installation)
- [CLI](#cli)
  - [--get &lt;key&gt;](#--get-key)
  - [--put &lt;key&gt;](#--put-key)
  - [--del &lt;key&gt;](#--del-key)
  - [--batch &lt;operations&gt;](#--batch-operations)
    - [Import / Export](#import--export)
    - [Bulk delete](#bulk-delete)
  - [--keys](#--keys)
  - [--values](#--values)
  - [--all](#--all)
  - [--gte &lt;key-pattern&gt;](#--gte-key-pattern)
  - [--lte &lt;key-pattern&gt;](#--lte-key-pattern)
  - [--prefix &lt;key-pattern&gt;](#--prefix-key-pattern)
  - [--match &lt;key-pattern&gt;](#--match-key-pattern)
  - [--limit &lt;number&gt;](#--limit-number)
  - [--reverse](#--reverse)
  - [--count](#--count)
  - [--keyEncoding &lt;string&gt;](#--keyencoding-string)
  - [--valueEncoding &lt;string&gt;](#--valueencoding-string)
  - [--location &lt;string&gt;](#--location-string)
- [--map &lt;JS function string or path&gt;](#--map-js-function-string-or-path)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

```sh
$ npm install -g lev2
```

## CLI
These all match the parameters used with [`levelup`](https://github.com/rvagg/node-levelup). The default encoding for the database is set to `json`.

### --get &lt;key&gt;
Get a value
```sh
lev $dbpath --get foo
```

### --put &lt;key&gt;
Put a value
```sh
lev $db_path --put foo --value bar
lev $db_path --put foo --value '{"a": 123}' --valueEncoding json
lev $db_path --put foo --value AZoV7p5e --valueEncoding base64
lev $db_path --put foo --value 019a15ede51d --valueEncoding hex
```

### --del &lt;key&gt;
Delete a value
```sh
lev $db_path --del foo
```
Can be used in combination with `--keys`, or `--all`, or implicit `--all`, to generate a stream of delete operations to be passed to the `lev $db_path --batch` command
```sh
lev $db_path --keys --del | lev $db_path --batch
lev $db_path --all --del | lev $db_path --batch
lev $db_path --gte abc --lte abd --del | lev $db_path --batch
```

### --batch &lt;operations&gt;
Put or delete several values, using [`levelup` batch syntax](https://github.com/Level/levelup#dbbatcharray-options-callback-array-form)
```sh
lev $db_path --batch '[
{"type":"del","key":"a"},
{"type":"put","key":"b","value":"123"},
{"type":"put","key":"c","value":"456"}
]'
```
or from a file
```sh
# there should be one entry per line
# either as valid JSON
echo '[
{"type":"del","key":"a"},
{"type":"put","key":"b","value":"123"},
{"type":"put","key":"c","value":"456"}
]' > ops.json
# or as newline-delimited JSON
echo '
{"type":"del","key":"a"}
{"type":"put","key":"b","value":"123"}
{"type":"put","key":"c","value":"456"}
' > ops.json
lev $db_path --batch ./operations.json
```

#### Import / Export
If the type is omitted, defaults to `put`, which allows to use the command to do imports/exports, in combination with [`--all`](#--all):
```sh
# export
lev $db_path --all > leveldb.export
# import
lev /tmp/my-new-db --batch leveldb.export
```
If it's a large export, you can use compress it on the fly
```sh
# export
lev $db_path --all | gzip -9 > leveldb.export.gz
# import
gzip -d < leveldb.export.gz | lev /tmp/my-new-db --batch
```

#### Bulk delete
The `--batch` option can also be used to delete key/values by range in 2 steps:
```
# 1 - collect all the key to delete
lev $db_path --prefix 'foo' --del > ./deletion_operations
# 2 - pass the file as argument to the --batch option
lev $db_path --batch ./deletion_operations
```

The same can be done with `--match`
```
lev $db_path --match '*foo*' --del > ./deletion_operations
```

### --keys
List all the keys in the current range
```sh
lev $db_path --keys
```
Can be used in combination with `--del` to generate a stream of delete operations
```sh
lev $db_path --keys --del | lev $db_path --batch
```

### --values
List all the values in the current range.
Emit as a new-line delimited stream of json.
```sh
lev $db_path --values
```

### --all
List all the keys and values in the current range.
Emit as a new-line delimited stream of json.
```sh
lev $db_path --all
```
It can be used to create an export of the database, to be imported with [`--batch`](#--batch)
```sh
lev $db_path --all > leveldb.export
lev /tmp/my-new-db --batch leveldb.export
```
It can be used in combinaision with other options, but can then also be omitted as its the default stream mode
```sh
lev $db_path --all --prefix 'foo'
# is equivalent to
lev $db_path --prefix 'foo'
```

### --gte &lt;key-pattern&gt;
Start the range at keys **g**reater **t**han or **e**qual to `<key-pattern>`. For strictly **g**reater **t**han, use `--gt`.
```sh
# output all keys and values after 'foo' (implicit --all)
lev $db_path --gte 'foo'
# output all keys after 'foo'
lev $db_path --keys --gte 'foo'
# the same for values
lev $db_path --values --gte 'foo'
```
For keys and values strictly greater tha

### --lte &lt;key-pattern&gt;
End the range at keys **l**ower **t**han or **e**qual to `<key-pattern>`. For strictly **l**ower **t**han, use `--`.
```sh
# output all keys and values before 'fooz' (implicit --all)
lev $db_path --lte 'fooz'
# output all keys before 'fooz'
lev $db_path --keys --lte 'fooz'
# the same for values
lev $db_path --values --lte 'fooz'
# output all keys between 'foo' and 'fooz'
lev $db_path --keys --gte 'foo' --lte 'fooz'
# which is equivalent to
```

### --prefix &lt;key-pattern&gt;
Get all entries for which the key starts by a given prefix
```sh
# get all the keys starting by foo
lev $db_path --keys --prefix 'foo'
# which is equivalent to
lev $db_path --keys --gte 'foo' --lte 'foo\uffff'
```

### --match &lt;key-pattern&gt;
Filter results by a pattern applied on the keys
```sh
lev  --keys --match 'f*'
lev  --values --match 'f*'
lev  --all --match 'f*'
# Equivalent to
lev $db_path --match 'f*'
```

See [`minimatch` doc](https://github.com/isaacs/minimatch#readme) for patterns

### --limit &lt;number&gt;
Limit the number of records emitted in the current range.
```sh
lev $db_path --keys --limit 10
lev $db_path --values --prefix 'foo' --limit 100
lev $db_path --match 'f*' --limit 10
```

### --reverse
Reverse the stream.
```sh
lev $db_path --keys --reverse
lev $db_path --keys --prefix 'foo' --limit 100 --reverse
```

### --count
Output the count of results in the selected range
```sh
# Count all the key/value pairs in the database
lev $db_path --count
# Counts the keys and values between 'foo' and 'fooz'
lev $db_path --prefix 'foo' --count
```

### --keyEncoding &lt;string&gt;
Specify the encoding for the keys (Defaults to 'utf8').
```sh
lev $db_path --put 019a17595db1 --keyEncoding hex --value ""
lev $db_path --put AZoXWV5c --keyEncoding base64 --value ""

lev $db_path --keys --keyEncoding utf8
lev $db_path --keys --keyEncoding json
lev $db_path --keys --keyEncoding hex
lev $db_path --keys --keyEncoding base64
```

### --valueEncoding &lt;string&gt;
Specify the encoding for the values (Defaults to 'utf8').
```sh
lev $db_path --values --valueEncoding utf8
lev $db_path --values --valueEncoding json
lev $db_path --values --valueEncoding hex
lev $db_path --values --valueEncoding base64
```

### --location &lt;string&gt;
Specify the path to the LevelDB to use. Defaults to the current directory.
```sh
lev $db_path --location /tmp/test-db --keys
# Equivalent to
lev /tmp/test-db --keys
```

## --map &lt;JS function string or path&gt;
Pass results in a map function
* either inline
```sh
lev $db_path --keys --map 'key => key.split(":")[1]'
lev $db_path --all --map 'data => data.value.replace(data.key, "")'
```
* or from a JS file that exports a function
```js
# in ./map_fn.js
module.exports = key => key.split(":")[1]
```
```sh
lev $db_path --keys --map ./map_fn.js
```

If the function, returns null or undefined, the result is filtered-out

This can be used to update the whole database:
```sh
# Create a map function that returns an object with the key and an updated value
echo 'module.exports = ({ key, value }) => ({
  key,
  value: value.replace('foo', 'bar')
})' > ./update_values.js
# Create an updated export of the database
lev $db_path --map ./update_values.js > ./updated_db
# And re-import
lev $db_path --batch ./updated_db
```
