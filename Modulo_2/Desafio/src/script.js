'use strict'

window.addEventListener('load', async() => {
    try {
        const result = await fetch('https://randomuser.me/api/?seed=javascript&results=100&nat=BR&noinfo');
        const httpResultArray = (await result.json()).results;
        console.dir(httpResultArray);
        const inputForPeople = document.getElementById('js-input-people');
        const buttonForSearch = document.getElementById('js-search-button');

        const regNumberStats = document.getElementById('js-reg-num');
        const menNumberStats = document.getElementById('js-men-num');
        const womenNumberStats = document.getElementById('js-women-num');
        const ageSumStats = document.getElementById('js-age-sum');
        const ageAvgStats = document.getElementById('js-age-avg');

        const statsRefObject = {
            regNumber: regNumberStats,
            menNumber: menNumberStats,
            womenNumber: womenNumberStats,
            ageSum: ageSumStats,
            ageAvg: ageAvgStats
        };

        inputForPeople.addEventListener('keyup', (event) => {
            console.dir(event.target.value);

            if (event.target.value.trim().length === 0) {
                clearStatistics(statsRefObject);
            } else {
                let filteredArray = filterArray(event, httpResultArray);
                let statsObject = retrieveStatistics(filteredArray);

                updateStatistics(statsRefObject, statsObject);
            }

            event.stopImmediatePropagation();
        });

    } catch {
        console.log('Erro ao requisitar dados da API!');
    }
});

function filterArray(event, httpResultArray) {
    let filteredArray = httpResultArray.filter((item) => {
        return item.name.first.toUpperCase().includes(event.target.value.toUpperCase()) ||
            item.name.last.toUpperCase().includes(event.target.value.toUpperCase()) ||
            item.name.title.toUpperCase().includes(event.target.value.toUpperCase()) ||
            item.dob.age == event.target.value
    }).map((item) => {
        return {
            firstName: item.name.first,
            lastName: item.name.last,
            fullName: `${item.name.first} ${item.name.last}`,
            age: item.dob.age,
            gender: item.gender,
            image: item.picture.thumbnail
        }
    }).sort((a, b) => {
        return a.firstName.toUpperCase().localeCompare(b.firstName.toUpperCase());
    });

    return filteredArray;
}

function clearStatistics(refObject) {
    refObject.regNumber.textContent = "0";
    refObject.menNumber.textContent = "0";
    refObject.womenNumber.textContent = "0";
    refObject.ageSum.textContent = "0";
    refObject.ageAvg.textContent = "0";

    return
}

function retrieveStatistics(filteredArray) {
    let regNumber = filteredArray.length;
    let menNumber = filteredArray.filter((item) => item.gender == "male").reduce((acc, cur) => acc + 1, 0);
    let womenNumber = filteredArray.filter((item) => item.gender == "female").reduce((acc, cur) => acc + 1, 0);
    let ageSum = filteredArray.reduce((acc, res) => acc + res.age, 0);
    let ageAvg = regNumber != 0 ? ageSum / regNumber : 0;

    return {
        totalReg: regNumber,
        numberOfMen: menNumber,
        numberOfWomen: womenNumber,
        sumOfAges: ageSum,
        avgOfAges: ageAvg
    }
}

function updateStatistics(refObject, statsObject) {
    refObject.regNumber.textContent = statsObject.totalReg.toString();
    refObject.menNumber.textContent = statsObject.numberOfMen.toString();
    refObject.womenNumber.textContent = statsObject.numberOfWomen.toString();
    refObject.ageSum.textContent = statsObject.sumOfAges.toString();
    refObject.ageAvg.textContent = statsObject.avgOfAges != 0 ? statsObject.avgOfAges.toFixed(2) : "0";
}