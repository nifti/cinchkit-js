'use strict';

const code = require('code');
const lab = require('lab').script();

const CinchUrlShortener = require('../index').CinchUrlShortener;

// -----

const describe = lab.describe;
const it = lab.it;
const expect = code.expect;

describe('url shortener', () => {
  let shortLink = null;
  const longLink = 'https://cinchpolls.com';
  const urlShortener = new CinchUrlShortener();

  it('should shorten the link', (done) => {
    return urlShortener.shortenLink(longLink, (err, result) => {
      expect(err).to.be.null();
      expect(result).to.startWith('http://');

      shortLink = result;

      done();
    });
  });

  it('should return long link', (done) => {
    return urlShortener.getLongLink(shortLink, (err, result) => {
      expect(err).to.be.null();
      expect(result).to.be.equal(longLink);

      done();
    });
  });

  it('should remove the short link', (done) => {
    return urlShortener.removeLink(shortLink, (err) => {
      expect(err).to.be.null();
      done();
    });
  });

  it('should return null', (done) => {
    return urlShortener.getLongLink(shortLink, (err, result) => {
      expect(err).to.be.null();
      expect(result).to.be.null();

      done();
    });
  });
});

exports.lab = lab;
