$(document).ready(function() {
  // for long pages when user triggers help modal at bottom of page
  $('.modal').on('show.bs.modal', function (e) {
    $('#osa-iframe').animate({
      scrollTop: 0
    }, 200);
  });
});

// create empty store object to use before db is loaded
const store = {
  admin: true,
  dbIsLoaded: false,
  auths: {
    app:{ enabled:false },
    sms:{ enabled:false, manyEnabled:false },
    rca:{ enabled:false },
    email:{ enabled:false, manyEnabled:false },
    errors:{ enabled:false }
  },
  write: (data) => db.update({
      enabled: !data.enabled
  })
};

// init viewModel and declare methods
var vm = new Vue({
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
    }
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
