let repoList = document.querySelector('.repo__list');
let input = document.querySelector('.header__search_input')
let btn = document.querySelector('.header__search_button')
let repoCardBlock = document.querySelector('.repo__card_block')
let prevPaginationBtn = document.querySelector('.pagination_prev__btn')
let nextPaginationBtn = document.querySelector('.pagination_next__btn')
let paginationList = document.querySelector('.pagination__list')
let activePaginationLink = document.getElementsByClassName('active')

async function start(url = 'https://api.github.com/search/repositories?q=stars&sort=stars page=2&per_page=10') {
    clear(repoList)
    const headers = {
        "Accept": "application/vnd.github.cloak-preview"
    }
    const response = await fetch(url, {
        "method": "GET",
        "headers": headers
    })
    const link = response.headers.get("link")
    const links = link.split(",");
    const urls = links.map(elem => {
        return {
            url: elem.split(";")[0].replace(">", "").replace("<", ""),
            page: elem.split(';')[0].split('&page=').pop().replace('>', '')
        }
    })

    let repos = await response.json();

    repos.items.forEach(element => {
        // getContributors(element)
        createList(element)
    });
    let arr = [];
    for (let url of urls) {
        arr.push(url.page)
    }

    function getMaxOfArray(numArray) {
        return Math.max.apply(null, numArray);
    }

    setPagination(url, getMaxOfArray(arr))
}

async function searchRepo(input = 'stars', url = `https://api.github.com/search/repositories?q=${input}&sort=stars page=2&per_page=10`) {
    clear(repoList)
    clear(paginationList)
    const headers = {
        "Accept": "application/vnd.github.cloak-preview"
    }
    const response = await fetch(url, {
        "method": "GET",
        "headers": headers
    })

    const link = response.headers.get("link")
    if (link) {
        const links = link.split(",");
        const urls = links.map(elem => {
            return {
                url: elem.split(";")[0].replace(">", "").replace("<", ""),
                page: elem.split(';')[0].split('&page=').pop().replace('>', '')
            }
        })
        let arr = [];
        for (let url of urls) {
            arr.push(url.page)
        }

        function getMaxOfArray(numArray) {
            return Math.max.apply(null, numArray);
        }
        setPagination(url, getMaxOfArray(arr))
    }

    let repos = await response.json();

    repos.items.forEach(element => {
        // getContributors(element)
        createList(element)
    });
}

btn.addEventListener('click', () => {
    value = input.value;
    clear(repoList)
    searchRepo(value)
})

function setPagination(url, lastPage) {
    for (let i = 1; i <= lastPage; i++) {
        let paginationItem = makeElement('li', 'pagination__item')
        let paginationLink = makeElement('a', 'pagination__link', i)
        if (paginationLink.textContent == 1) {
            paginationItem.classList.add('active')
        }
        paginationLink.addEventListener('click', function(e) {
            toggleClassPagination(e.target);
            transitionPage(url, e.target.textContent)
        })
        paginationItem.appendChild(paginationLink)

        paginationList.appendChild(paginationItem)
    }
}

async function transitionPage(url, page) {
    clear(repoList)
    let currentUrl = url.replace('&page=2', '') + `&page=${page}`
    const response = await fetch(currentUrl)
    let repos = await response.json();
    repos.items.forEach(element => {
        // getContributors(element)
        createList(element)
    });
}

function toggleClassPagination(target) {
    if (activePaginationLink.length > 0 && activePaginationLink[0] !== this) {
        activePaginationLink[0].classList.remove('active')
    }
    target.parentElement.classList.add('active')
    let step = 0
    if (target.textContent > 3) {
        step = (target.textContent - 1) * 30
        step -= 60
    }
    paginationList.style.transform = `translateX(-${step}px)`
}


// async function getContributors(element) {
//     let contr = await fetch(element.contributors_url)
//     let a = await contr.json();
//     console.log(element.contributors_url)
//     console.log(a)
// }

start()

function makeElement(tagName, className, text) {
    let element = document.createElement(tagName);
    element.classList.add(className);
    if (text) {
        element.textContent = text
    }
    return element
}

function createList(obj) {
    let listItem = makeElement('li', 'repo__item');

    let title = makeElement('h2', 'repo__title', obj.name)
    title.innerHTML = "<span>Название репозитория:  </span>" + title.textContent
    title.addEventListener('click', () => {
        createRepoCard(obj)
    })
    listItem.appendChild(title);

    let rating = makeElement('div', 'repo__rating', obj.stargazers_count)
    rating.innerHTML = "<span>Количество звезд:  </span>" + rating.textContent
    listItem.appendChild(rating);

    let commitDate = makeElement('div', 'commit_date', obj.pushed_at)
    commitDate.innerHTML = "<span>Дата последнего коммита: </span>" + commitDate.textContent
    listItem.appendChild(commitDate);

    let link = makeElement('a', 'repo__link', 'Ссылка на репозиторий')
    link.title = obj.html_url
    link.href = obj.html_url
    listItem.appendChild(link);

    repoList.appendChild(listItem)
}

function createRepoCard(obj) {
    let repoCard = makeElement('div', 'repo__card');

    let repoCardHeaderInfo = makeElement('div', 'repo__card_header');

    let repoCardTitle = makeElement('h2', 'repo__card_title', obj.name)
    repoCardHeaderInfo.appendChild(repoCardTitle);

    let repoCardRating = makeElement('div', 'repo__card_rating', obj.stargazers_count)
    repoCardHeaderInfo.appendChild(repoCardRating);

    let repoCardCommitDate = makeElement('div', 'repo__card_commit_date', obj.pushed_at)
    repoCardHeaderInfo.appendChild(repoCardCommitDate);

    repoCard.appendChild(repoCardHeaderInfo)

    let repoCardUserInfo = makeElement('div', 'repo__card_user_info')

    let userFoto = makeElement('div', 'user__foto')

    let userFotoPic = makeElement('img', 'user__foto_pic')
    userFotoPic.src = obj.owner.avatar_url
    userFoto.appendChild(userFotoPic)

    repoCardUserInfo.appendChild(userFoto)

    let userDesc = makeElement('div', 'user__desc')

    let userName = makeElement('p', 'user__name', obj.owner.login)
    userDesc.appendChild(userName)

    let userLink = makeElement('a', 'user__link', obj.html_url.replace(obj.name, ''))
    userLink.href = obj.html_url.replace(obj.name, '')
    userDesc.appendChild(userLink)

    repoCardUserInfo.appendChild(userDesc)

    let userLanguage = makeElement('div', 'user__language', obj.language)
    repoCardUserInfo.appendChild(userLanguage)

    let userRepoDesc = makeElement('div', 'user__description', obj.description)
    repoCardUserInfo.appendChild(userRepoDesc)

    repoCard.appendChild(repoCardUserInfo)

    let closeBtn = makeElement('button', 'repo__card_close_btn', 'закрыть')
    closeBtn.addEventListener('click', () => {
        clear(repoCardBlock)
    })

    repoCard.appendChild(closeBtn)

    repoCardBlock.appendChild(repoCard)
}

function clear(block) {
    while (block.firstChild)
        block.removeChild(block.firstChild)
}