// start of code to make mobile look good
function isMobileDevice() {
    return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
}

function setNavBarToDrawer() {
    const checkBtn = document.getElementsByClassName('checkbtn')[0];
    checkBtn.style.display = 'block';

    checkBtn.checkBoxClicked = () => { onCheckBoxClicked(); };

    const nav = document.getElementsByTagName('nav')[0];
    const list = nav.getElementsByTagName('ul')[0];
    list.style.position = 'fixed';
    list.style.width = '100%';
    list.style.height = '100vh';
    list.style.backgroundColor = '#555';
    list.style.top = '80px';
    list.style.left = '-130%';
    list.style.textAlign = 'center';
    list.style.transition = 'all 500ms';
    list.style.paddingLeft = '0px';

    const liList = list.children;
    for (let i = 0; i < liList.length; i++) {
        const li = liList[i];
        li.style.display = 'block';
        li.style.height = '70px';

        const a = li.getElementsByTagName('a')[0];
        a.style.fontSize = '40px';
        a.style.padding = "0px";
    }
}

function onCheckBoxClicked() {
    const nav = document.getElementsByTagName('nav')[0];
    const list = nav.getElementsByTagName('ul')[0];

    const check = document.getElementById('check');

    if (list.style.left != '0px') {
        list.style.left = '0px';
    } else {
        list.style.left = '-130%';
    }
}

if (isMobileDevice()) {
    setNavBarToDrawer();
}
// end of code to make mobile look good

setTimeout(function() {
    var h1Wrappers = document.getElementsByClassName("h1-wrapper");

    for (var i = 0; i < h1Wrappers.length; i++) {
        var el = h1Wrappers[i];
        setTimeout(removeLoading.bind(null, el), i * 500);
    }

}, 500);

function removeLoading(element) {
    element.classList.remove("loading");
}

function checkBoxClicked() {
    const checkbox = document.getElementById('check');
    if (!checkbox.checked) {
        console.log("hide iframe");
        document.getElementById('grady-video').hidden = true;
    } else {
        console.log('show iframe');
        setTimeout(() => {
            document.getElementById('grady-video').hidden = false;
        }, 500);

    }
}