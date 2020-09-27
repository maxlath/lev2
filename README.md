# lev2

A [CLI](https://en.wikipedia.org/wiki/Command-line_interface) and a [REPL](https://en.wikipedia.org/wiki/Read%E2%80%93eval%E2%80%93print_loop) for managing [`LevelDB`](http://leveldb.org/) instances.

This repo is a **fork** of [`lev`](https://github.com/hxoht/lev), originally to make [those changes](https://github.com/hxoht/lev/pull/59) available from NPM

[![NPM](https://nodei.co/npm/lev2.png?stars&downloads&downloadRank)](https://npmjs.com/package/lev2/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/badge/node-%3E=%20v6.4.0-brightgreen.svg)](http://nodejs.org)

## Features
* [CLI](#cli)
  * providing many basic tools to read and write on a leveldb from the command line
  * import / export, and delete by range
* [REPL](#repl)
  * with colorized tab-completion and zsh/fish style key suggestions
  * automatically saves and reloads REPL history

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
  - [--valueEncoding &lt;string&gt;](#--valueencoding-string)
  - [--location &lt;string&gt;](#--location-string)
- [--map &lt;JS function string or path&gt;](#--map-js-function-string-or-path)
- [REPL](#repl)
  - [GET &lt;key&gt;](#get-key)
  - [PUT &lt;key&gt; &lt;value&gt;](#put-key-value)
  - [DEL &lt;key&gt;](#del-key)
  - [LS](#ls)
  - [START &lt;key-pattern&gt;](#start-key-pattern)
  - [END &lt;key-pattern&gt;](#end-key-pattern)
  - [LIMIT &lt;number&gt;](#limit-number)
  - [REVERSE](#reverse)

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
lev --get foo
```

### --put &lt;key&gt;
Put a value
```sh
lev --put foo --value bar
```

### --del &lt;key&gt;
Delete a value
```sh
lev --del foo
```
Can be used in combination with `--keys`, or `--all`, or implicit `--all`, to generate a stream of delete operations to be passed to the `lev --batch` command
```sh
lev --keys --del | lev --batch
lev --all --del | lev --batch
lev --gte abc --lte abd --del | lev --batch
```

### --batch &lt;operations&gt;
Put or delete several values, using [`levelup` batch syntax](https://github.com/Level/levelup#dbbatcharray-options-callback-array-form)
```sh
lev --batch '[
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
lev --batch ./operations.json
```

#### Import / Export
If the type is omitted, defaults to `put`, which allows to use the command to do imports/exports, in combination with [`--all`](#--all):
```sh
# export
lev --all > leveldb.export
# import
lev /tmp/my-new-db --batch leveldb.export
```
If it's a large export, you can use compress it on the fly
```sh
# export
lev --all | gzip -9 > leveldb.export.gz
# import
gzip -d < leveldb.export.gz | lev /tmp/my-new-db --batch
```

#### Bulk delete
The `--batch` option can also be used to delete key/values by range in 2 steps:
```
# 1 - collect all the key to delete
lev --prefix 'foo' --del > ./deletion_operations
# 2 - pass the file as argument to the --batch option
lev --batch ./deletion_operations
```

The same can be done with `--match`
```
lev --match '*foo*' --del > ./deletion_operations
```

### --keys
List all the keys in the current range
```sh
lev --keys
```
Can be used in combination with `--del` to generate a stream of delete operations
```sh
lev --keys --del | lev --batch
```

### --values
List all the values in the current range.
Emit as a new-line delimited stream of json.
```sh
lev --values
```

### --all
List all the keys and values in the current range.
Emit as a new-line delimited stream of json.
```sh
lev --all
```
It can be used to create an export of the database, to be imported with [`--batch`](#--batch)
```sh
lev --all > leveldb.export
lev /tmp/my-new-db --batch leveldb.export
```
It can be used in combinaision with other options, but can then also be omitted as its the default stream mode
```sh
lev --all --prefix 'foo'
# is equivalent to
lev --prefix 'foo'
```

### --gte &lt;key-pattern&gt;
Start the range at keys **g**reater **t**han or **e**qual to `<key-pattern>`. For strictly **g**reater **t**han, use `--gt`.
```sh
# output all keys and values after 'foo' (implicit --all)
lev --gte 'foo'
# output all keys after 'foo'
lev --keys --gte 'foo'
# the same for values
lev --values --gte 'foo'
```
For keys and values strictly greater tha

### --lte &lt;key-pattern&gt;
End the range at keys **l**ower **t**han or **e**qual to `<key-pattern>`. For strictly **l**ower **t**han, use `--`.
```sh
# output all keys and values before 'fooz' (implicit --all)
lev --lte 'fooz'
# output all keys before 'fooz'
lev --keys --lte 'fooz'
# the same for values
lev --values --lte 'fooz'
# output all keys between 'foo' and 'fooz'
lev --keys --gte 'foo' --lte 'fooz'
# which is equivalent to
```

### --prefix &lt;key-pattern&gt;
Get all entries for which the key starts by a given prefix
```sh
# get all the keys starting by foo
lev --keys --prefix 'foo'
# which is equivalent to
lev --keys --gte 'foo' --lte 'foo\uffff'
```

### --match &lt;key-pattern&gt;
Filter results by a pattern applied on the keys
```sh
lev  --keys --match 'f*'
lev  --values --match 'f*'
lev  --all --match 'f*'
# Equivalent to
lev --match 'f*'
```

See [`minimatch` doc](https://github.com/isaacs/minimatch#readme) for patterns

### --limit &lt;number&gt;
Limit the number of records emitted in the current range.
```sh
lev --keys --limit 10
lev --values --prefix 'foo' --limit 100
lev --match 'f*' --limit 10
```

### --reverse
Reverse the stream.
```sh
lev --keys --reverse
lev --keys --prefix 'foo' --limit 100 --reverse
```

### --count
Output the count of results in the selected range
```sh
# Count all the key/value pairs in the database
lev --count
# Counts the keys and values between 'foo' and 'fooz'
lev --prefix 'foo' --count
```

### --valueEncoding &lt;string&gt;
Specify the encoding for the values (Defaults to 'json').
```sh
lev --values --valueEncoding buffer
```

### --location &lt;string&gt;
Specify the path to the LevelDB to use. Defaults to the current directory.
```sh
lev --location /tmp/test-db --keys
# Equivalent to
lev /tmp/test-db --keys
```

## --map &lt;JS function string or path&gt;
Pass results in a map function
* either inline
```sh
lev --keys --map 'key => key.split(":")[1]'
lev --all --map 'data => data.value.replace(data.key, "")'
```
* or from a JS file that exports a function
```js
# in ./map_fn.js
module.exports = key => key.split(":")[1]
```
```sh
lev --keys --map ./map_fn.js
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
lev --map ./update_values.js > ./updated_db
# And re-import
lev --batch ./updated_db
```

## REPL

![screenshot](/docs/screenshot.png)

Start the REPL
```sh
# in the current directory
$ lev .
# somewhere else
$ lev path/to/db
```

Use upper or lower case for the following commands.

### GET &lt;key&gt;
Get a key from the database.

### PUT &lt;key&gt; &lt;value&gt;
Put a value into the database. If you have `keyEncoding` or `valueEncoding`
set to `json`, these values will be parsed from strings into `json`.

### DEL &lt;key&gt;
Delete a key from the database.

### LS
Get all the keys in the current range.

### START &lt;key-pattern&gt;
Defines the start of the current range. You can also use `GT` or `GTE`.

### END &lt;key-pattern&gt;
Defines the end of the current range. You can also use `LT` or `LTE`.

### LIMIT &lt;number&gt;
Limit the number of records in the current range (defaults to 5000).

### REVERSE
Reverse the records in the current range.
