LIB = $(shell find lib -name "*.js" -type f | sort)
TEST = $(shell find test -name "*.js" -type f | sort)

default: test

lint: $(LIB) $(TEST)
	@node ./node_modules/.bin/jshint --reporter ./node_modules/jshint-stylish/index.js $^

test: lint
	@node ./node_modules/lab/bin/lab -a code

example:
	@node ./example/index.js | ./node_modules/.bin/bunyan

.PHONY: test example
