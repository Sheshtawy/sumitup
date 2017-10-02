'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _ = require('lodash');
var GithubClient = require('github');

// {
//     "text": "Here's what your team at Crowdanalyzer have been up to today!",
//     "attachments": [
//         {
//             "title": "Repositories: 123",
//             "fields": [
// 				{
// 					"title": "Created",
// 					"value": "12",
// 					"short": true
// 				},
// 				{
// 					"title": "Deleted",
// 					"value": "12",
// 					"short": true
// 				},
// 				{
// 					"title": "Updated",
// 					"value": "12",
// 					"short": true
// 				}

// 			]
//         },
//         {
//             "title": "Pull Requests: 143",
//             "fields": [
//                 {
//                     "title": "new",
//                     "value": "50",
//                     "short": true
//                 },
//                 {
//                     "title": "closed",
//                     "value": "50",
//                     "short": true
//                 },
//                 {
//                     "title": "deleted",
//                     "value": "50",
//                     "short": true
//                 }
//             ]
//         },
//         {
//             "title": "Review Comments: 260",
//             "fields": [
//                 {
//                     "title": "specifications#1",
//                     "value": "50",
//                     "short": true
//                 },
//                 {
//                     "title": "data-platforms#23",
//                     "value": "50",
//                     "short": true
//                 }
//             ]
//         },
//         {
//             "title": "Commits: 312",
//             "fields": [
//                 {
//                     "title": "specifications#1",
//                     "value": "50",
//                     "short": true
//                 },
//                 {
//                     "title": "data-platforms#23",
//                     "value": "50",
//                     "short": true
//                 }
//             ]
//         },
//         {
//             "title": "Issues: 312",
//             "fields": [
//                 {
//                     "title": "specifications#1",
//                     "value": "50",
//                     "short": true
//                 },
//                 {
//                     "title": "data-platforms#23",
//                     "value": "50",
//                     "short": true
//                 }
//             ]
//         }
//     ]
// }
var slackMessageTemplate = function slackMessageTemplate(data) {
  return {
    title: data.title,
    attachments: _.map(data.entries, function (entry) {
      return {
        title: entry.title + ': ' + entry.totalCount,
        fields: _.map(entry.fields, function (field) {
          return {
            title: field.title,
            value: field.value,
            short: true
          };
        })
      };
    })

  };
};

var Organization = function () {
  /**
   * Creates an instance of Organization.
   * @param {string} name 
   * @param {Object} client instance of an API Client 
   * @memberof Organization
   */
  function Organization(name, client) {
    _classCallCheck(this, Organization);

    this.name = name;
    this.repositories = {};
    this.pullRequests = {};
    this.issues = {};
    this.commits = {};
    this._morningTime = new Date(2017, 9, 1);
    this._morningTime.setUTCHours(8);
    this._morningTime.setUTCMinutes(0);
    this._morningTime.setUTCSeconds(0);
    this._morningTime.setMonth(9);
    this._morningTimeIso = this._morningTime.toISOString().split('.')[0];
    console.log(this._morningTimeIso);
    this._client = client;
  }

  _createClass(Organization, [{
    key: 'getNewRepositories',
    value: function getNewRepositories() {
      return this._getRepositories('created');
    }
  }, {
    key: 'getUpdatedRepositories',
    value: function getUpdatedRepositories() {
      return this._getRepositories('updated');
    }
  }, {
    key: 'getPushedRepositories',
    value: function getPushedRepositories() {
      return this._getRepositories('pushed');
    }
  }, {
    key: 'getOpenPullRequests',
    value: function getOpenPullRequests() {
      return this._getResources('pr', 'open');
    }
  }, {
    key: 'getMergedPullRequests',
    value: function getMergedPullRequests() {
      return this._getResources('pr', 'merged');
    }
  }, {
    key: 'getClosedPullRequests',
    value: function getClosedPullRequests() {
      return this._getResources('pr', 'closed');
    }
  }, {
    key: 'getOpenIssues',
    value: function getOpenIssues() {
      return this._getResources('issue', 'open');
    }
  }, {
    key: 'getClosedIssues',
    value: function getClosedIssues() {
      return this._getResources('issue', 'closed');
    }
  }, {
    key: 'sumItUp',
    value: function sumItUp() {
      var promises = [this._sumUpRepositories(), this._sumUpPullRequests(), this._sumUpIssues()];

      return Promise.all(promises).then(function (result) {
        return _.merge.apply(_, _toConsumableArray(result));
      });
    }
  }, {
    key: '_sumUpRepositories',
    value: function _sumUpRepositories() {
      var _this = this;

      var promises = [];
      promises.push(this.getNewRepositories());
      promises.push(this.getUpdatedRepositories());
      promises.push(this.getPushedRepositories());

      return Promise.all(promises).then(function (result) {
        _this.repositories = _.merge.apply(_, _toConsumableArray(result));
        return { repositories: _this.repositories };
      });
    }
  }, {
    key: '_sumUpPullRequests',
    value: function _sumUpPullRequests() {
      var _this2 = this;

      var promises = [];
      promises.push(this.getOpenPullRequests());
      promises.push(this.getClosedPullRequests());
      promises.push(this.getMergedPullRequests());

      return Promise.all(promises).then(function (result) {
        _this2.pullRequests = _.merge.apply(_, _toConsumableArray(result));
        return { pull_requests: _this2.pullRequests };
      });
    }
  }, {
    key: '_sumUpIssues',
    value: function _sumUpIssues() {
      var _this3 = this;

      var promises = [];
      promises.push(this.getOpenIssues());
      promises.push(this.getClosedIssues());

      return Promise.all(promises).then(function (result) {
        _this3.issues = _.merge.apply(_, _toConsumableArray(result));
        return { issues: _this3.issues };
      });
    }
  }, {
    key: '_getRepositories',
    value: function _getRepositories(category) {
      return this._client.search.repos({ q: 'org:' + this.name + '+' + category + ':>' + this._morningTimeIso }).then(function (result) {
        return _defineProperty({}, category, result.data.total_count);
      });
    }
  }, {
    key: '_getResources',
    value: function _getResources(type, state) {
      return githubClient.search.issues({ q: 'org:' + this.name + '+created:>' + this._morningTimeIso + '+type:' + type + '+is:' + state }).then(function (result) {
        return _defineProperty({}, state, result.data.total_count);
      });
    }
  }]);

  return Organization;
}();

module.exports = function (context, cb) {
  var githubConfig = {
    timeout: 5000,
    host: context.secrets.api_endpoint,
    protocol: "https",
    headers: {
      accept: context.secrets.api_header
    }
  };

  var githubClient = new GithubClient(githubConfig);

  githubClient.authenticate({
    type: 'token',
    token: context.secrets.api_token
  });

  if (_.isNil(context.body.orgName) && _.isNil(context.data.orgName)) {
    var err = new Error('Invalid or missing organization name');
    cb(err);
  }

  var orgName = !_.isNil(context.body.orgName) ? context.body.orgName : context.data.orgName;
  var org = new Organization('facebook', githubClient);

  return org.sumItUp().then(function (result) {
    cb(null, result);
  }).catch(function (err) {
    console.log(err);
    cb(err);
  });
};
