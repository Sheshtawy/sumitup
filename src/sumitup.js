'use strict';
const _ = require('lodash');
const GithubClient = require('github');

const templates = {
  slack: data => {
    return {
      text: `Here's what your team at ${data.org_name} have been up to today!`,
      attachments: _.map(data, element => {
        return {
          title: element.title,
          fields: _.map(element.entries, (value, key) => {
            return {
              title: key,
              value,
              short: true,
            };
          }),
        };
      })
    };
  },
  json: data => data
};



class Organization {
  /**
   * Creates an instance of Organization.
   * @param {string} name 
   * @param {Object} client instance of an API Client 
   * @memberof Organization
   */
  constructor(name, client) {
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
    console.log(this._morningTimeIso)
    this._client = client;
  }

  getNewRepositories() {
    return this._getRepositories('created');
  }

  getUpdatedRepositories() {
    return this._getRepositories('updated');
  }

  getPushedRepositories() {
    return this._getRepositories('pushed');
  }

  getOpenPullRequests() {
    return this._getResources('pr', 'open');
  }

  getMergedPullRequests() {
    return this._getResources('pr', 'merged');
  }

  getClosedPullRequests() {
    return this._getResources('pr', 'closed');
  }

  getOpenIssues() {
    return this._getResources('issue', 'open');
  }

  getClosedIssues() {
    return this._getResources('issue', 'closed');
  }


  sumItUp(templateName = 'json') {
    const promises = [
      this._sumUpRepositories(),
      this._sumUpPullRequests(),
      this._sumUpIssues(),
    ];

    return Promise.all(promises)
      .then(result => {
        result.org_name = _.capitalize(this.name);
        return templates[templateName](result);
      });
    
  }

  _sumUpRepositories() {
    const promises = [];
    promises.push(this.getNewRepositories());
    promises.push(this.getUpdatedRepositories());
    promises.push(this.getPushedRepositories());
      
    return Promise.all(promises)
      .then(result => {
          this.repositories = _.merge(...result);
          return { 
            title: 'Repositories', 
            entries: this.repositories
           };
      });
  }

  _sumUpPullRequests() {
    const promises = [];
    promises.push(this.getOpenPullRequests());
    promises.push(this.getClosedPullRequests());
    promises.push(this.getMergedPullRequests());
      
    return Promise.all(promises)
      .then(result => {
          this.pullRequests = _.merge(...result);
          return { 
            title: 'Pull Requests', 
            entries: this.pullRequests 
          };
      });
  }

  _sumUpIssues() {
    const promises = [];
    promises.push(this.getOpenIssues());
    promises.push(this.getClosedIssues());
      
    return Promise.all(promises)
      .then(result => {
          this.issues = _.merge(...result);
          return { 
            title: 'Issues', 
            entries: this.issues 
          };
      });
  }

  _getRepositories(category) {
    return this._client.search.repos(
      { q: `org:${this.name}+${category}:>${this._morningTimeIso}` }
    )
    .then(result => {
      return { [category]: result.data.total_count };
    });
  }

  _getResources(type, state) {
    return this._client.search.issues(
      { q: `org:${this.name}+created:>${this._morningTimeIso}+type:${type}+is:${state}` }
    )
    .then(result => {
      return { [state]: result.data.total_count };
    });
  }

}

module.exports = (context, cb) => {
  // validate slack token in case of an incoming slash command
  if((!_.isNil(context.body) && !_.isNil(context.body.token)) &&
    (context.secrets.slack_token !== context.body.token)) {
    const err = new Error('Invalid slack token, are you sure this your webtask?' +
      ' Maybe you forgot to add the slack token to your secrets!'
    );
  }

  const githubConfig = {
    timeout: 5000,
    host: context.secrets.api_endpoint,
    protocol: "https",
    headers: {
      accept: context.secrets.api_header,
    }
  };
  
  const githubClient = new GithubClient(githubConfig);
  
  githubClient.authenticate({
    type: 'token',
    token: context.secrets.api_token,
  });
  
  // Extract organization name and decide rendering template
  let orgName, templateName;
  if(!_.isNil(context.body) && !_.isNil(context.body.text)) {
    orgName = context.body.text;
    templateName = 'slack';
  } else if(!_.isNil(context.data) && !_.isNil(context.data.orgName)) {
    orgName = context.data.orgName;
    templateName = 'json';
  } else {
    const err = new Error('Invalid or missing organization name');
    cb(err);
  }
  
  const org = new Organization(orgName, githubClient);
  
  return org.sumItUp(templateName)
    .then(result => {
      cb(null, result);
    })  
    .catch(err => {
      console.log(err);
      cb(err);
    });

};
