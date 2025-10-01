const seleccio_buttons=document.querySelector('.donate__seleccio');

const once_monthly=document.querySelectorAll('.donate__seleccio button');

const amounts=document.querySelectorAll('.donate__amounts *');

const amount_grid=document.querySelector('.donate__amounts');

const input_amount=document.querySelector('#wanted_amount');

const submit_form=document.querySelector('#submit-form');

seleccio_buttons.addEventListener('click',(e)=>{
    e.preventDefault();
    if(seleccio_buttons.dataset.times==='monthly'){
        seleccio_buttons.dataset.times='once';
    }else{
        seleccio_buttons.dataset.times='monthly';
    }


    if(seleccio_buttons.dataset.times==='monthly'){
        once_monthly[0].classList.remove('add-blue');
        once_monthly[1].classList.add('add-blue');
    }else{
        once_monthly[1].classList.remove('add-blue');
        once_monthly[0].classList.add('add-blue');
    }
});

for(let i=0;i<amounts.length;i++){
    amounts[i].addEventListener('click',(e)=>{
        e.preventDefault();
})};
amount_grid.addEventListener('click',(e)=>{
    e.preventDefault();
    e.currentTarget.dataset.amount=e.target.dataset.amount;
    for(let i=0;i<amounts.length;i++){
        amounts[i].classList.remove('add-blue');
    }
    e.target.classList.add('add-blue');
})        

input_amount.addEventListener('input',(e)=>{

})

submit_form.addEventListener('click',(e)=>{
    e.preventDefault();
    amount_grid.dataset.amount=input_amount.value;
    
})

