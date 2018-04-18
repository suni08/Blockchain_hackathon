pragma solidity ^0.4.0;

contract Enteral {
    address public patient;
    address public doctor;
    address public formulary;
    
    mapping (address => uint) public id;
    mapping (address => uint) public weight;
    mapping (address => uint) public pid;
    mapping (address => uint) public dosage;
    mapping (address => string) public alert;
    
    event Sent(address from, address to, uint pid);
    event SentDose(address from, address to, uint pid);

    function createPatientInfo(address receiver, uint ppid, uint pweight, uint pdosage) public  {
        patient = msg.sender;
        if (msg.sender != patient) return;
        id[receiver] = 0;
        pid[receiver] = ppid;
        weight[receiver] = pweight;
        dosage[receiver] = pdosage;
    }
    
    function createDoctorInfo(address receiver, uint pdocid) public  {
        if (pdocid > 10000) return;
        doctor = msg.sender;
        id[receiver] = pdocid;
        pid[receiver] = 0;
        weight[receiver] = 0;
        dosage[receiver] = 0;
    }
    
    function createFormularyInfo(address receiver, uint formulaid) public {
        if (formulaid < 10000) return;
        formulary = msg.sender;
        id[receiver] = formulaid;
        pid[receiver] = 0;
        weight[receiver] = 0;
        dosage[receiver] = 0;
    }

    function sendRequiredInfo(address receiver, uint ppid) public {
        if (pid[msg.sender] != ppid) return;
        pid[receiver] = ppid;
        weight[receiver] = weight[msg.sender];
        dosage[receiver] = dosage[msg.sender];
        emit Sent(msg.sender, receiver, ppid);
    } 
    
      function checkPatientInfo(address receiver, uint ppid, uint prevWeight) public {
        if(id[msg.sender] < 10000) return;
        pid[receiver] = ppid;
        if(weight[receiver] < prevWeight)
            alert[receiver]="Patient Weight Decreased";
        else alert[receiver]="Normal";
    }
    
    function sendLatestPatientInfo(address receiver) public{
        if(id[msg.sender] < 10000) return;
        uint i=pid[msg.sender];
        uint w=weight[msg.sender];
        checkPatientInfo(receiver,i,w);
    }
    
    function sendDosageInfo(address receiver, uint ppid) public {
        if(id[msg.sender] != ppid) return;
        pid[receiver] = ppid;
        dosage[receiver] = dosage[msg.sender];
        emit SentDose(msg.sender, receiver, ppid);
    }
    
}

