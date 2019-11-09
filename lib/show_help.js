const help = `Usage: lev [DB-PATH] [OPTIONS]

REPL
$ lev [DB PATH]

CLI
$ lev [DB PATH] [OPTIONS]

Options:
  --get KEY                               Get a value

  --put KEY VALUE                         Put a value

  --del KEY                               Delete a value

  --batch JSON|JSON-FILE-PATH             Put or delete several values

  --keys                                  List all the keys in the current range

  --values                                List all the values in the current range.
                                          Emit as a new-line delimited stream of json.

  --all                                   List all the keys and values in the current range.
                                          Emit as a new-line delimited stream of json.
                                          It can be used to create an export of the database, to be imported with --batch

  --start,--gt,--gte KEY-PATTERN          Specify the start of the current range

  --end,--lt,--lte KEY-PATTERN            Specify the end of the current range

  --match KEY-PATTERN                     Filter results by a pattern applied on the keys

  --limit                                 Limit the number of records emitted in the current range

  --reverse                               Reverse the stream

  --count                                 Output the count of results in the selected range

  --valueEncoding ENCODING                Specify the encoding for the values (Defaults to 'json')

  --location DB-PATH                      Specify the path to the LevelDB to use.
                                          Defaults to the current directory.

  --map JS-FUNCTION|JS-FUNCTION-PATH      Pass results in a map function.
                                          If the function, returns null or undefined, the result is filtered-out

Examples:
  # Get a value
  lev --get foo

  # Put a value
  lev --put foo --value bar

  # Delete a value
  lev --del foo

  # List all the keys
  lev --keys

  # List all the values
  lev --values

  # List all the keys and values
  lev --all

  # List all the keys in a specific range
  lev --keys --start 'foo' --end 'fooz'
  lev --keys --gte 'foo' --lte 'foo'

  # List values for which the key matches a certain pattern
  lev --match 'record-*-2019' --values

  # Get the first 100 entries in a given range
  lev --keys --start 'foo' --end 'fooz' --limit 100

  # Get the last 100 entries in a given range
  lev --keys --start 'foo' --end 'fooz' --limit 100 --reverse

  # Pass results in a map function
  lev --keys --map 'key => key.split(":")[1]'
  lev --all --map 'data => data.value.replace(data.key, "")'

  # Pass results in a function exported from a JS module
  echo 'module.exports = key => key.split(":")[1]' > ./map_fn.js
  lev --keys --map ./map_fn.js

Advanced:
  # Put or delete several values in batch
  lev --batch '
  {"type":"del","key":"a"}
  {"type":"put","key":"b","value":"123"}
  {"type":"put","key":"c","value":"456"}
  '

  # Same but by taking the operations from a file
  lev --batch ./operations.json

  # Export / import
  lev --all > leveldb.export
  lev /tmp/my-new-db --batch leveldb.export

  # Delete by range
  lev --keys --del --start 'foo' --end 'fooz' | lev --batch

  # Update all the database
  ## Create a map function that returns an object with the key and an updated value
  echo 'module.exports = ({ key, value }) => ({
    key,
    value: value.replace('foo', 'bar')
  })' > ./update_values.js
  ## Create an updated export of the database
  lev --map ./update_values.js > ./updated_db
  ## And re-import
  lev --batch ./updated_db`

module.exports = () => console.log(help)
