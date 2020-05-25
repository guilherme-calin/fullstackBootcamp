import { people } from './people.js'

window.addEventListener('load', () => {
    console.log('carregou!');

    let mapArray = people.map((item) => {
        return { nome: item.name.first, email: item.email };
    });

    let filterArray = people.filter((item) => {
        return item.dob.age === 27
    })

    let reducedValue = people.reduce((accumulated, current) => {
        return accumulated + current.dob.age;
    }, 0);

    let findElement = people.find((item) => {
        return item.location.state === "Santa Catarina";
    });

    let isItForSome = people.some((item) => {
        return item.location.state === "Minas Gerais";
    });

    let isItForAll = people.every((item) => {
        return item.dob.age >= 22;
    });

    let sortedArray = people.sort((itemA, itemB) => {
        return itemA.dob.age - itemB.dob.age;
    });

    console.dir(sortedArray);
})