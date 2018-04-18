App = {
  web3Provider: null,
  contracts: {},
  names: new Array(),
  patient :null,
  transaction:0,
  flag:false,
  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
        // Is there is an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fallback to the TestRPC
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:9545');
    }
    web3 = new Web3(App.web3Provider);
    App.populateAddress();
    return App.initContract();
  },

  initContract: function() {
      $.getJSON('Enternal.json', function(data) {
    // Get the necessary contract artifact file and instantiate it with truffle-contract
        var voteArtifact = data;
        App.contracts.vote = TruffleContract(voteArtifact);

    // Set the provider for our contract
        App.contracts.vote.setProvider(App.web3Provider);
        App.getMinter();
        App.currentAccount = web3.eth.coinbase;
        return App.bindEvents();
      });
  },

  bindEvents: function() {

    $(document).on('click', '#update_pat', function(){ App.handlePatient(jQuery('#enter_patient_address').val(),jQuery('patient_id').val(),jQuery('display_dose').val(),jQuery('display_weight').val()); });
    $(document).on('click', '#send_pat', function(){ App.handleTransfer(jQuery('#enter_doctor_address').val(),jQuery('#send_amount').val()); });
    $(document).on('click', '#balance', function(){ App.handleBalance(); });
  },


  populateAddress : function(){ 
 
    new Web3(new Web3.providers.HttpProvider('http://localhost:9545')).eth.getAccounts((err, accounts) => {
      jQuery.each(accounts,function(i){
        var optionElement = '<option value="'+accounts[i]+'">'+accounts[i]+'</option';
          jQuery('#enter_patient_address').append(optionElement);
          if(web3.eth.coinbase != accounts[i]){
            jQuery('#enter_doctor_address').append(optionElement);
	    jQuery('#enter_formula_address').append(optionElement);  
          }
      });
    });
  },

  getMinter : function(){
    App.contracts.vote.deployed().then(function(instance) {
      return instance.patient();
    }).then(function(result) {
      App.patient = result;
      if(App.minter != App.currentAccount){
        jQuery('#patient_details').css('display','none');
      }else{
        jQuery('#patient_details').css('display','block');
      }
    })
  },

  handlePatient: function(addr,value1, value2, value3){

      if(App.currentAccount != App.patient){
        alert("Not a patient");
        return false;
      }
      var coinInstance;
      App.contracts.vote.deployed().then(function(instance) {
        coinInstance = instance;

        return coinInstance.createPatientInfo(addr,value1, value2, value3);
      }).then( function(result){
        if(result.receipt.status == '0x01')
          alert(value1 +" patient information added successfully to "+addr);
        else
          alert("Creation failed")
      }).catch( function(err){
        console.log(err.message);
      })
  },


  handleTransfer: function(addr,value1, value2) {

    if(addr == ""){
      alert("Please select an adrdess");
      return false;
    }
    if(value1 == ""){
      alert("No patient information");
      return false;
    }

    var coinInstance;
    App.contracts.vote.deployed().then(function(instance) {
      coinInstance = instance;
      return coinInstance.sendRequiredInfo(addr,value1, value2);
    }).then( function(result){

      // Watching Events 
      
      if(result.receipt.status != '0x01')
          alert("Transfer failed");
        
        // Look for the event Sent
        // Notification 
        if (log.event == "Sent") {
          var text = 'Patient information shared.';
          jQuery('#showmessage_text').html(text);
          jQuery('#show_event').animate({'right':'10px'});
          setTimeout(function(){jQuery('#show_event').animate({'right':'-410px'},500)}, 15000);
          break;
        }
      }
      return coinInstance.balances(App.currentAccount);
    }).catch( function(err){
      console.log(err.message);
    })
  },


$(function() {
  $(window).load(function() {
    App.init();
    console.log('starting app.js');
  });
});
