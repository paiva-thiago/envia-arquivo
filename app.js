console.log(' ______    _________  _____    '); 
console.log('|_   _ `. |  _   _  ||_   _|   '); 
console.log('  | | `. \\|_/ | | \\_|  | |   ');  
console.log('  | |  | |    | |      | |     ');
console.log(' _| |_.` /   _| |_    _| |_    ');
console.log('|______.`   |_____|  |_____|   ');
var nodemailer = require('nodemailer');
var dateFormat = require('dateformat');
const pug = require('pug');
var fs = require('fs');
/** Arquivos de propriedades 
 * As informações de configurações de email estão em arquivos .json localizadas no diretório resources 
 * O método abaixo cuida da carga, e a constante da execução. 
 * NÃO COLOCAR PROD EM TEMPO DE TESTE!
 * */
const execucao = 'PRD';
var carga = function (arq){
    return JSON.parse(fs.readFileSync('./resources/'.concat(arq).concat('.').concat(execucao.toLowerCase()).concat('.json')));
}
var prp   = carga('props');
var smtp  = carga('smtp');

//Para gerar um objeto com as informações do arquivo:
var objArquivo = function (str){
    var arrFile = str.split('\\');
    nome = arrFile.pop();
    var ext = nome.substr(nome.indexOf('.')+1);
    return {
        nome:nome,
        caminho:str,
        extensao:ext
    }
}

let opts  = {
    hoje: dateFormat(new Date(),'dd/mm/yyyy'),
    copia: prp.mailDir,
    listaClasses: ' ',
    sistemas:prp.sistemas.join(',')
  };
if(prp.somenteClass){
    for(let i=2;i<process.argv.length;i++) {
        if(objArquivo(process.argv[i]).extensao!="class"){
            console.error("TIPO DE ARQUIVO INVÁLIDO - somente arquivos com extensão class são aceitos neste processo!");
            console.info("Encerrando aplicação...");
            process.exit(1);
        }
    }
}
for(let i=2;i<process.argv.length;i++) {
    let val = process.argv[i];
    let arquivo = objArquivo(val);    
    console.log('Copiando '.concat(arquivo.nome).concat('...'));
    let stream = fs.readFileSync(arquivo.caminho);
    
    fs.writeFileSync(prp.dir.concat(arquivo.nome), stream);
    opts.listaClasses = opts.listaClasses.concat(arquivo.nome).concat(' ');                
}
let formatado =pug.renderFile('./emails/carteiro/html.pug', opts);
let assunto =pug.renderFile('./emails/carteiro/subject.pug', opts);
let texto =pug.renderFile('./emails/carteiro/texto.pug', opts);


let smtpTransport = nodemailer.createTransport(smtp);



// setup e-mail data with unicode symbols
var mailOptions = {
    from: prp.de.concat(' <').concat(prp.from).concat('>'),//'Thiago Paiva <mailer@thiagopaiva.com>', // sender address
    replyTo: prp.replyTo,
    to:  prp.to, 
    cc:  prp.cc, 
    subject: assunto, // Subject line
    subject: assunto, // Subject line
    text: texto, 
    html: formatado // html body
}

// send mail with defined transport object
smtpTransport.sendMail(mailOptions, function(error, response){
    if(error){
        console.log(error);
    }else{
        console.log('Processo concluído!');
    }

    // if you don't want to use this transport object anymore, uncomment following line
    smtpTransport.close(); // shut down the connection pool, no more messages
});