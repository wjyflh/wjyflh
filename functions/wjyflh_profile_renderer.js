// require('es6-promise').polyfill();
require('isomorphic-fetch');

const gh = require("octonode")
const Unsplash = require('unsplash-js').default

// Github markdown chnaging section START & END
const changeStarter = `<!-- changer START -->`
const changeEnder   = `<!-- changer END -->`


// Instantiate Github client from Github API
const gh_client = gh.client({
    username: process.env.GH_USERNAME,
    password: process.env.GH_ACCESS_TOKEN,
})

// Instantiate Unsplash client from Github API
// Generated in Unsplash official application dashboard
const unsplash = new Unsplash({accessKey: process.env.UNSPLASH_ACCESS_TOKEN})



// Main function here
const shakeItOut = async () => {
    
    const gh_repo = gh_client.repo(`wjyflh/wjyflh`);
    let unsplash_search_photos = ``;
    let searchTopics = ["cloud", "Mountain", "life", "coding"]

    // topics that I wanna search
    unsplash_search_photos = await unsplash.search.photos(searchTopics[Math.floor(Math.random() * 4)], 1, 10, {orientation: "landscape"})
        .then(res => (res.json()))
        .then(data => {
            return data.results.map(data => data.urls).map(url => url.regular)
        });


    const [readme] = await gh_repo.readmeAsync()
    const originReadMeContent = Buffer.from(readme.content, 'base64').toString('utf-8')
    const newContent =
    `${changeStarter}\n![](${unsplash_search_photos[Math.floor(Math.random() * 5)]})\nHello World!^^ 👋\n${changeEnder}`

    const newReadmeContent = originReadMeContent.split(changeStarter)[0] + newContent + originReadMeContent.split(changeEnder)[1]

    console.log(originReadMeContent)
    console.log(newReadmeContent)

    await gh_repo.updateContentsAsync(readme.path, 'Update readme contents',newReadmeContent, readme.sha)
}


// bind Netlify with their Functions handler
const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET'
};

exports.handler = async function () {
    try {
        await shakeItOut()
    } catch (error) {
        
        // funcotion run err 
        console.error(error)

        return {
            statusCode: 500,
            headers,
            body: 'Internal Server Error',
        }
    }

    return {
        statusCode: 200,
        headers,
        body: 'OK! new README.md rendered ^_>^)b',
    }
}
