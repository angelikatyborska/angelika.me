---
title: Rubyist's first attempt at testing JavaScript
excerpt: How to do everything that RSpec can do, but with Mocha, Chai, Sinon, and Proxyquire.
tags: [testing, ruby, javascript, rspec, mocha, sinon]
date: 2016-04-22 20:29:00 +0200
---

I have to confess something. I have written way too many lines of JavaScript without ever writing a single test. Untested JavaScript used to be silently accepted. All the JavaScript tutorials I did never even mentioned testing. Fortunately, it's all changing rapidly. Testing is becoming a must in the JavaScript community as much as it is in all the others.

I have joined a React project recently. It was already setup with Mocha. I was very pleasantly surprised to find out how much it resembled RSpec. I want to share with you a side by side comparison of identical test suites, the first one written in RSpec, the second one in Mocha.

## The test subjects

To make the examples easier to understand, let's break the rules of TDD and write the code under test first. 

- A `Bomb` can be defused or detonated. When detonated, it raises an error. It can be detonated instantly or with a delay. It has a production date.
- A `RedButton` detonates a bomb with a delay of 1000 ms.

### Ruby
```ruby
# lib/bomb.rb
class Bomb
  def initialize
    @production_date = Time.now
  end

  def detonate(delay = nil)
    sleep delay if delay
    raise 'You are dead. No more coding.' unless @defused
  end

  def cut_wire(color)
    if the_right_wire == color
      @defused = true
    else
      detonate
    end
  end

  def the_right_wire
    rand < 0.5 ? :blue : :red
  end

  def production_date
    @production_date
  end
end
```

``` ruby
# lib/red_button.rb
require_relative 'bomb'

class RedButton
  def press
    Bomb.new.detonate(1)
  end
end
```

### JavaScript (ES6)
```js
// lib/bomb.js
export default class Bomb {
  constructor() {
    this.productionDate = new Date;
  }

  detonate(delay) {
    let goOff = () => {
      if (!this.disarmed) {
        throw 'You are dead. No more coding.';
      }
    };

    if (delay) {
      setTimeout(goOff, delay);
    }
    else {
      goOff();
    }
  }

  cutWire(color) {
    if (this.theRightWire() == color) {
      return this.disarmed = true;
    }
    else {
      this.detonate();
      return false;
    }
  }

  theRightWire() {
    return Math.random() < 0.5 ? 'blue' : 'red'
  }

  getProductionDate() {
    return this.productionDate;
  }
}
```

```js
// lib/red_button.js
import Bomb from './bomb'

export default class RedButton {
  press() {
    new Bomb().detonate(1000);
  }
}
```

## Dependencies

### RSpec
- [RSpec](http://rspec.info/) - a testing framework,
- [Timecop](https://github.com/travisjeffery/timecop) - a gem for testing time-dependent code.

```ruby
# Gemfile
source 'https://rubygems.org'
gem 'rspec'
gem 'timecop'
```

### Mocha

- [Mocha](https://mochajs.org/) - a testing framework,
- [Chai](http://chaijs.com/) - an assertion library that offers three different interfaces, the BDD/expect interface is very similar to RSpec's
- [Sinon](http://sinonjs.org/) - a library for spying, stubbing, and mocking,
- [Sinon-Chai](https://github.com/domenic/sinon-chai) - a set of pretty Chai assertions for Sinon's spies,
- [Proxyquire](https://github.com/thlorenz/proxyquire) - a tool for messing with the way modules get imported, allows us to swap some dependencies of a module we want to test to mocks without changing anything in the module's source code, works with ES6 modules and Babel,
- [Timekeeper](https://github.com/vesln/timekeeper) - a library for testing time-dependent code.

```json
// package.json
{
  "scripts": {
    "test": "mocha --recursive --compilers js:babel-register"
  },
  "dependencies": {
    "babel": "^6.5.2",
    "babel-preset-es2015": "^6.6.0"
  },
  "devDependencies": {
    "babel-register": "^6.7.2",
    "chai": "^3.5.0",
    "mocha": "^2.4.5",
    "proxyquire": "^1.7.4",
    "sinon": "^1.17.3",
    "sinon-chai": "^2.8.0",
    "timekeeper": "0.0.5"
  }
}
```

## Setup

### RSpec

The default setup of RSpec done with `rspec --init` creates a setup file called `spec_helper.rb`, which is loaded with `--require spec_helper` in `.rspec`. 

### Mocha

Mocha has no convention of a setup file. There is a way to load a file running the test suite with `mocha --require foo.js`. In this file, however, Mocha is not available (we might want to have Mocha available to set global `before` and `after` hooks) . To solve this problem I have decided to create a `test_helper.js` and simply include it in every test file. Mocha loads all `.js` files from the test directory before running any tests, so that's technically not necessary unless you want to run separate test files, which I definitely do.

```js
// test/test_helper.js
import chai from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import proxyquire from 'proxyquire'
import timekeeper from 'timekeeper'

chai.use(sinonChai);

global.sinon = sinon;
global.expect = chai.expect;
global.proxyquire = proxyquire;
global.timekeeper = timekeeper;
```

## Basic syntax

It's practically identical. We have the same `describe`, `context`, `it`, `before` and `after` methods, with the exception of `beforeEach` and `afterEach` being separate methods.

### RSpec

```ruby
# spec/lib/bomb_spec.rb
require_relative '../../lib/bomb'

RSpec.describe Bomb do
  let(:bomb) { Bomb.new }

  describe '#detonate' do
    it 'kills the developer' do
      expect { bomb.detonate }.to raise_error(
        RuntimeError,
        'You are dead. No more coding.'
      )
    end
  end
end
```

### Mocha + Chai

```js
// test/lib/bomb_test.js
import '../test_helper'
import Bomb from '../../lib/bomb'

describe('Bomb', () => {
  let bomb;

  beforeEach(() => {
    bomb = new Bomb;
  });

  describe('#detonate', () => {
    it('kills the developer', () => {
      expect(() => { bomb.detonate(); }).to.throw(
        'You are dead. No more coding.'
      );
    });
  });
});
```

Properties like `to`, `be`, `been`, `have`, `has` etc. are there only for readability. They do not affect the assertions.

## Overwriting dependencies

The `RedButton` has a very dangerous dependency on `Bomb`. We want to be able to test the button without actually detonating any bombs, so we need to get rid of the dangerous parts. In Ruby every class is accessible in the global scope, so that's how we grab it and just rewrite its behavior.

### RSpec

```ruby
# spec/lib/red_button_spec.rb
require_relative '../../lib/red_button'

describe RedButton do
  let(:button) { described_class.new }
  let(:bomb) { double('bomb') }

  before do
    allow(Bomb).to receive(:new) { bomb }
    allow(bomb).to receive(:detonate)
  end

  describe '#press' do
    it 'can be pressed' do
      expect { button.press }.not_to raise_error
    end
  end
end
```

### Mocha + Proxyquire

In Javascript, every file imports modules to its own local scope. To overwrite a dependency, we have to fiddle with the import. Proxyquire is the tool for that job. It takes two arguments. The first one is the path to the module whose dependencies we will change (`lib/red_button.js`). This path is relative to the file where Proxyquire got imported, i.e. `test/setup.js`. The second one is a mapping of paths to objects overwriting exports. Those paths are relative to the file whose dependencies we're rewriting, i.e. `lib/red_button.js`. Specifying `{ default: SafeBomb }` means that the object exported with the name `default` (`exports default class Bomb ...`) will be swapped to `SafeBomb` . If there were any other exports in that file, they would not be affected. Proxyquire returns an object with all the exports from the imported file.

```js
// test/lib/red_button_test.js
import '../test_helper'
import Bomb from '../../lib/bomb'

describe('RedButton', () => {
  let RedButton, button;

  before(() => {
    class SafeBomb extends Bomb { detonate() {} }
    RedButton = proxyquire(
      '../lib/red_button',
      { './bomb': { default: SafeBomb } }
    ).default;
  });

  beforeEach(() => {
    button = new RedButton;
  });

  describe('#press', () => {
    it('can be pressed', () => {
      expect(() => { button.press(); }).not.to.throw();
    });
  });
});
```

## Spying

Spies are fake methods that know how they were used - how many times they were called and with what arguments.

### Ruby

```ruby
# spec/lib/red_button_spec.rb
require_relative '../../lib/red_button'

describe RedButton do
  let(:button) { described_class.new }
  let(:bomb) { spy('bomb') }

  before do
    allow(Bomb).to receive(:new) { bomb }
  end

  describe '#press' do
    it 'detonates a bomb' do
      button.press
      expect(bomb).to have_received(:detonate)
        .with(1).exactly(1).times
    end
  end
end
```

### Mocha + Proxyquire + Sinon

```js
// test/lib/red_button_test.js
import '../test_helper'

describe('RedButton', () => {
  let RedButton, button, detonate;

  before(() => {
    detonate = sinon.spy();
    class SafeBomb extends Bomb { 
      constructor() { super(); this.detonate = detonate } 
    }
    RedButton = proxyquire(
      '../lib/red_button',
      { './bomb': { default: SafeBomb } }
    ).default;
  });

  beforeEach(() => {
    button = new RedButton;
  });

  afterEach(() => {
    detonate.reset();
  });

  describe('#press', () => {
    it('detonates a bomb', () => {
      button.press();
      expect(detonate).to.have.been.calledWith(1000);
      expect(detonate).to.have.been.calledOnce;
    });
  });
});
```

## Stubbing

Stubs are fake methods pre-programmed to return a certain value or to throw an error. They can change their behavior depending on arguments received or how many times they were called previously.

### RSpec

```ruby 
# spec/lib/bomb_spec.rb
require_relative '../../lib/bomb'

RSpec.describe Bomb do
  let(:bomb) { described_class.new }

  describe '#cut_the_wire' do
    before :each do
      allow(bomb).to receive(:the_right_wire)
        .and_return(:red, :blue, :red)
      # allow(bomb).to receive(:the_right_wire)
      #  .with('foo').and_throw('bar')
    end

    it 'disarms the bomb' do
      expect(bomb.cut_wire(:red)).to eq(true)
      expect(bomb.cut_wire(:blue)).to eq(true)
      expect(bomb.cut_wire(:red)).to eq(true)
      expect(bomb.cut_wire(:red)).to eq(true)
      expect(bomb.cut_wire(:red)).to eq(true)
    end
  end
end
```

### Mocha + Sinon

```js
// test/lib/bomb_test.js
import '../test_helper'
import Bomb from '../../lib/bomb'

describe('Bomb', () => {
  let bomb;

  beforeEach(() => {
    bomb = new Bomb;
  });

  describe('#cutWire', () => {
    beforeEach(() => {
      bomb.theRightWire = sinon.stub();
      bomb.theRightWire.onCall(0).returns('red');
      bomb.theRightWire.onCall(1).returns('blue');
      bomb.theRightWire.returns('red');
      // bomb.theRightWire.withArgs('foo').throws('bar');
    });

    it('disarms the bomb', () => {
      expect(bomb.cutWire('red')).to.be.true
      expect(bomb.cutWire('blue')).to.be.true
      expect(bomb.cutWire('red')).to.be.true
      expect(bomb.cutWire('red')).to.be.true
      expect(bomb.cutWire('red')).to.be.true
    });
  });
});
```

## Time travel

### RSpec + Timecop

```ruby
# spec/lib/generic_spec.rb
context 'in the past' do
  before do
    Timecop.travel(Time.at(1))
  end

  after do
    Timecop.return
  end
end
```

### Mocha + Timekeeper

```js
// test/lib/generic_test.js
context('in the past', () => {
  before(() => {
    timekeeper.travel(new Date(1));
  });

  after(() => {
    timekeeper.reset();
  });
});
```

## Freezing time

### RSpec + Timecop

```ruby
# spec/lib/generic_spec.rb
context 'frozen in time' do
  before do
    Timecop.freeze(Time.at(1))
  end

  after do
    Timecop.return
  end
end
```

### Mocha + Timekeeper

```js
// test/lib/generic_test.js
context('frozen in time', () => {
  before(() => {
    timekeeper.freeze(new Date(1));
  });

  after(() => {
    timekeeper.reset();
  });
});
```

## Custom assertions

One of my favorite things to do to tidy up the test suite is defining custom assertions. In this example, I will write one for asserting that a bomb is old. Let's assume a bomb is old if it was produced before 1976 (that's in bomb years! I am not saying the same condition applies to people). But does that mean that any bomb produced in or after 1976 is not old by our standards? I don't think so. The line between being old and not being old is blurry. I'm going to assume that a bomb is not old if it's been produced in 1996 ar later. That's not a problem because both RSpec and Chai allow for a different boolean expression in the case of a negated assertion.

### RSpec

#### Definition

```ruby
# spec/support/matchers/old.rb
require 'rspec/expectations'

RSpec::Matchers.define :be_old do
  match do |actual|
    actual.production_date.year < 1976
  end

  match_when_negated do |actual|
    actual.production_date.year >= 1996
  end

  failure_message do |actual|
    "expected object to be produced before 1976, "\
    "but it was produced in #{actual.production_date.year}"
  end

  failure_message_when_negated do |actual|
    "expected object not to be produced before 1996, "\
    "but it was produced in #{actual.production_date.year}"
  end
end
```

#### Import

```ruby
# spec/spec_helper.rb
require_relative 'support/matchers/old'
```

#### Usage
```ruby
# spec/lib/bomb_spec.rb
expect(bomb).to be_old
```

### Mocha + Chai

#### Definition

```js
// test/support/assertions/old.js
export default function (_chai, utils) {
  utils.addProperty(_chai.Assertion.prototype, 'old', function() {
    let condition,
      message,
      messageWhenNegated,
      expected,
      actual,
      subject = this._obj;

    if (utils.flag(this, 'negate')) {
      expected = 1996;
    }
    else {
      expected = 1976;
    }

    actual = subject.getProductionDate().getFullYear();
    condition = actual < expected;
    message =
      'expected object to be produced before #{exp}, ' +
      'but it was produced in #{act}';
    messageWhenNegated =
      'expected object not to be produced before #{exp}, ' +
      'but it was produced in #{act}';

    this.assert(
      condition,
      message,
      messageWhenNegated,
      expected,
      actual
    );
  });
};
```

#### Import
```js
// test/test_helper.js
import old from './support/assertions/old';
chai.use(old);
```

#### Usage
```js
// test/lib/bom_test.js
expect(bomb).to.be.old;
```

In Chai, we can define an assertion as either a property or a method. There is an `addMethod` method for the latter. Method assertions are, obviously, used like so:

```js
expect(bomb).to.be.old();
```

A really cool thing in Chai is flagging. Using `utils.flag()`, which is either a getter or a setter, we can flag an assertion in a [chainable method](http://chaijs.com/api/plugins/#addchainablemethod-ctx-name-method-chainingbehavior), to later read that flag in another method, used further in the chain. `negate` is a built-in flag that gets set when the assertion chain includes `not` (`expect(...).not.to.equal(...)`). I recommend reading the documentation on Chai's [plugin concepts](http://chaijs.com/guide/plugins/) and [plugin utilities](http://chaijs.com/api/plugins/).

## Testing asynchronous methods

Something that rarely applies to Ruby, but almost always is needed in JavaScript.

### Waiting for a callback

It is important to know that Mocha will not wait for all the callbacks to be executed. If this example below happens to be the only one to be run, it will pass. If other examples get run afterwards and thus there is enough time for this callback to be executed, it will fail. Do not do this!

```js
it('will not wait the callback', () => {
  // this test is unpredictable!
  setTimeout(() => {
    expect(false).to.be.true;
  }, 1000);
});
```

We can, however, force Mocha to wait. The `it` function can take an argument, usually called `done`, which is a method. Mocha will wait for the test suite to call this method before finishing running the example. We should call it inside the callback.

```js
// test/lib/generic_test.js
import '../test_helper'

describe('Mocha', () => {
  it('can wait for a callback', (done) => {
    setTimeout(() => { console.log('ding!'); done(); }, 1000);
  });
});
```

It is also important to remember that a test taking longer than 2000ms will fail with a timeout.

Mocha reports the time of unusually slow tests.

```
  Mocha
ding!
    ✓ can wait for a callback (1004ms)
```

### Manually moving time forward with Sinon

```js
// test/lib/bomb_test.js
import '../test_helper'
import Bomb from '../../lib/bomb'

describe('Bomb', () => {
  let bomb;
  
  context('manually controlled time', () => {
    let clock;

    before(() => {
      clock = sinon.useFakeTimers();
    });

    after(() => {
      clock.restore();
    });

    it('kills the developer with a delay', () => {
      bomb.detonate(10);

      expect(() => { clock.tick(9) }).not.to.throw();
      expect(() => { clock.tick(1) }).to.throw(
      'You are dead. No more coding.'
      );
    });
  });
});
```

## Source

If you want to mess around with the tests I wrote, they can be found [here](https://github.com/angelikatyborska/rspec-vs-mocha).

## Conclusion

It's really easy to get into testing JavaScript with Mocha if you already know RSpec. Chai has pretty awesome utilities for adding new assertions and extending existing ones. I would recommend using Mocha with Chai to my fellow RSpec fans, it feels really familiar.