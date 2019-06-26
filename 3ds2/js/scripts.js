$(document).ready(function() {
  // for long pages when user triggers help modal at bottom of page
  $('.modal').on('show.bs.modal', function (e) {
    $('#osa-iframe').animate({ scrollTop: 0 }, 200);
  });
  // for long pages when user triggers help modal at bottom of page
  $('.collapse').on('show.bs.collapse', function (e) {
    $('#osa-iframe').animate({ scrollTop: $('#osa-iframe').prop('scrollHeight')}, 200);
  });
});


// create empty store object to use before db is loaded
const store = {
  admin: true,
  dbIsLoaded: false,
  date: '15/07/19',
  amazondate: '15 Jul 2019',
  urlID: '?ID=0',
  auths:{
    app:{ enabled:false },
    sms:{ enabled:false, manyEnabled:false, otp:'123456' },
    rca:{ enabled:false, otp:'18821337' },
    email:{ enabled:false, manyEnabled:false, otp:'123ABC' },
    errors:{ enabled:false }
  },
  write: (data) => db.update({
      enabled: !data.enabled
  }),
  sms: {
    otpInput: '',
    otpIsEmpty: false,
    otpIsInvalid: false,
    otpIsIncorrect: false,
    otpIsValid: false,
    otpAttemptsCount: 0,
    smsIsVisible: true,
    wasSmsResendPressed: false
  }
};

// init viewModel and declare methods
var vueVm = new Vue({
  el: '#osa-page',
  data: store,
  methods: {
    adminIcon: function(methodId){
      if(this.auths[methodId].enabled) return 'fa-check';
      else return 'fa-times';
    },
    adminManyNumbersIcon: function(methodId){
      if(!this.auths[methodId].manyEnabled) return 'fa-check';
      else return 'fa-times';
    },
    methodClasses: function(methodId){
      var classes = ' btn-secondary';
      if(this.auths[methodId].enabled) classes += ' d-block';
      else classes += ' d-none';
      return classes;
    },
    methodUrl: function(methodId){
      if(this.auths.errors.enabled){
        if(methodId == 'sms' || methodId == 'email') return "use" + methodId + ".html";
        else if(methodId == 'smsotp' || methodId == 'emailotp') return "use" + methodId + "error.html";
        else return "use" + methodId + "error.html";
      }
      else return "use" + methodId + ".html";
    },
    toggleMethod: function(methodId){
      db.doc(methodId).update({
        enabled: !this.auths[methodId].enabled
      });
    },
    toggleManyNumbers: function(methodId){
      db.doc(methodId).update({
        manyEnabled: !this.auths[methodId].manyEnabled
      });
    },
    showPromo: function(){
      if(!this.auths.app.enabled || !this.auths.sms.enabled) return true;
      else return false;
    },
    showPromoMethod: function(methodId){
      if(!this.auths[methodId].enabled) return true
      else return false;
    },
    showManyNumbers: function(methodId){
      if(!this.auths[methodId].manyEnabled) return true
      else return false;
    },
    calcPromoMethodsAvailable: function(){
      if(!this.auths.app.enabled && !this.auths.sms.enabled) return "appandsms";
      else if (!this.auths.app.enabled) return "apponly";
      else if (!this.auths.sms.enabled) return "smsonly";
    },
    timedDelayModalClose: function(modalId) {
      setTimeout(function(){
        $(modalId).modal('hide')
      }, 1000);
    },
    getTodaysDate: function() {
      var today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0');
      var yy = today.getFullYear().toString().substr(-2);
      this.date = dd + '/' + mm + '/' + yy;
    },
    getTomorrowsDate: function() {
      var tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      var dd = String(tomorrow.getDate()).padStart(2, '0');
      var mm = tomorrow.toLocaleString('en-us', { month: 'short' });
      var yyyy = tomorrow.getFullYear().toString();
      this.amazondate = dd + ' ' + mm + '. ' + yyyy;
    },
    checkOtp: function(otpType) {
      console.log(this.sms.otpInput);
      // show sms message modal
      if(this.sms.otpInput.length == 0) {
        // show otp required field message
        console.log("OTP REQUIRED");
        this.sms.otpIsEmpty = true;
        this.sms.otpIsInvalid = false;
        this.sms.otpIsIncorrect = false;
        this.sms.otpIsValid = false;
      }
      else if(this.sms.otpInput.length != 6) {
        // show incorrect format error
        console.log("INCORRECT FORMAT");
        this.sms.otpIsEmpty = false;
        this.sms.otpIsInvalid = true;
        this.sms.otpIsIncorrect = false;
        this.sms.otpIsValid = false;
      }
      else if (this.auths[otpType].otp == this.sms.otpInput) {
        // redirect to complete page
        console.log("PASS");
        this.sms.otpIsEmpty = false;
        this.sms.otpIsInvalid = false;
        this.sms.otpIsIncorrect = false;
        this.sms.otpIsValid = true;
        window.location.href = "complete.html";
      }
      else {
        // show incorrect match error
        console.log("INCORRECT CODE");
        this.sms.otpAttemptsCount++;
        this.sms.otpIsEmpty = false;
        this.sms.otpIsInvalid = false;
        this.sms.otpIsIncorrect = true;
        this.sms.otpIsValid = false;
        if(this.sms.otpAttemptsCount == 3) {
          this.cancelVerification();
        }
      }
    },
    getUrlParameter: function(name) {
      name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
      var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
      var results = regex.exec(location.search);
      if(results === null) this.urlID = '?' + name + '=0';
      else this.urlID = '?' + name + '=' + decodeURIComponent(results[1].replace(/\+/g, ' '));
    },
    smsResendPress: function() {
      $("html, body").animate({ scrollTop: 0 }, "fast");
      this.sms.wasSmsResendPressed = true;
      var vm = this;
      setTimeout(function() {
        vm.sms.wasSmsResendPressed = false;
      }, 1000);
    },
    startVerification: function() {
      window.location.href = "smsotp.html" + this.urlID;
    },
    cancelVerification: function() {
      window.location.href = "surveycancelled.html" + this.urlID;
    },
    completeSurvey: function() {
      window.location.href = "index.html" + this.urlID;
    }
  },
  created: function() {
    this.getTodaysDate();
    this.getTomorrowsDate();
    this.getUrlParameter('ID');
  }
});


// onSnapshot is executed every time the data in the underlying firestore collection changes
// It will get passed an array of references to the documents that match your query
db.onSnapshot((dataUpdate) => {
  const methods = [];
  dataUpdate.forEach((doc) => {
    const method = doc.data();
    method.id = doc.id;
    methods[method.id] = method;
  });
  store.auths = methods;
  store.dbIsLoaded = true;
  console.log("updated db: ", methods);
});
