
function Mail_views(id) {
  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      // Print email
      console.log(email);

      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#details').style.display = 'block';

      document.querySelector('#details').innerHTML = `<ul class="list-group">
      <li class="list-group-item"> <b>Sender: </b>${email.sender}</li>
      <li class="list-group-item"><b>TO: </b>${email.recipients}</li>
      <li class="list-group-item"><b>Subject: </b>${email.subject}</li>
      <li class="list-group-item"><b>Tmestamp: </b>${email.timestamp}</li>
      <li class="list-group-item"><b></b>${email.body}</li>
    </ul>`; 

    // Mark the email as read
    if (!email.read) {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          read: true
        })
      })
      .then(() => {
        // Update client-side
        email.read = true;
      })
    }

    // Archive button
    const arch_button = document.createElement('button');
    if (email.archived) {
      arch_button.innerHTML = 'unarchived';
      arch_button.className = "btn btn-outline-success";
    } else {
      arch_button.innerHTML = 'archived';
      arch_button.className = "btn btn-outline-danger";
    }

    arch_button.addEventListener('click', function() {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: !email.archived
        })
      })
      .then(() => {
        
        email.archived = !email.archived;
        load_mailbox('archive');
      })
    });
    document.querySelector('#details').append(arch_button);
  //reply
    const reply_button = document.createElement('button');
    
      reply_button.innerHTML = 'Reply';
      reply_button.className = "btn btn-outline-secondary";
      reply_button.addEventListener('click', ()=> {
        
        compose_email();

        document.querySelector('#compose-recipients').value = email.sender;
        let subject = email.subject;
        if (!subject.startsWith('Re: ')) {
          subject = 'Re: ' + subject;
        }
        
        document.querySelector('#compose-subject').value =subject;
        document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
      
      
      
      });
        
    
    document.querySelector('#details').append(reply_button);

  });
}

document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_email);


  



  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch(`/emails/${mailbox}`)
.then(response => response.json())
.then(emails => {
    //  emails
    emails.forEach(element_email => {
      const new_email = document.createElement('div');

      //style the email
      new_email.classList.add('email');
      
    new_email.innerHTML = new_email.innerHTML = `
    <ul class="list-group">
        <li class="list-group-item">
            <span class="send-space">${element_email.sender}</span>
            <span class="sub-space">${element_email.subject}</span>
            <span class="time-space">${element_email.timestamp}</span>
        </li>
    </ul>`;




      if (element_email.read) {
        new_email.classList.add('read');
    } else {
        new_email.classList.add('unread');
    }
    
    new_email.addEventListener('click', () => {
      Mail_views(element_email.id);
    });
    
      
      document.querySelector('#emails-view').append(new_email);
  });
  

    // ... do something else with emails ...
});
}


function send_email(event) {
  event.preventDefault();
  // Clear out composition fields
  const rec=document.querySelector('#compose-recipients').value;
  const sub=document.querySelector('#compose-subject').value;
  const bod =document.querySelector('#compose-body').value;
  
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: rec,
        subject: sub,
        body: bod
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      load_mailbox(" message has  successfully delivered")
  });
 
}
