let Parser = require('rss-parser');
let parser = new Parser();
let fs = require('fs')
let axios = require('axios')

keywords = []

fs.readFileSync('keywords.txt', 'utf8').split('\n').forEach(word=>{
    keywords.push(` ${word.replace(/(\r\n|\n|\r)/gm, "").toLowerCase()} `)
});

rsss = []

fs.readFileSync('rsss.txt','utf8').split('\n').forEach(word=>{
    rsss.push(word.replace(/(\r\n|\n|\r)/gm, "").toLowerCase())
});

console.log(rsss)

let grabRss = function(rsss){
    rsss.forEach(rss =>{

        (async () => {
            let feed = await parser.parseURL(rss);
                    
            feed.items.forEach(item => {
                try{
                    let title = item['title'].toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    let content = item['content'].toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    let link = item['link']
                    
                    let count = 0
                    let matched = false
                    while (!matched){
                        if (keywords.length > count){
                         
                            if (title.includes(keywords[count]) || content.includes(keywords[count]) ){
                                console.log(keywords[count])
                                let row = [title,link,content].toString()
                                
                                fs.appendFileSync('ecologicalnews.txt','\r\n')
                                fs.appendFileSync('ecologicalnews.txt',row)
                                matched = true
                            }             
                            
                            count++


                        }else{
                            matched = true
                        }
                            
                     
                    }
                }catch(err){
                    console.log(err)
                }
            });
          })();
    })
   
};

grabRss(rsss)
