const fetch = require("node-fetch");
const util = require("util");
const parseXML = util.promisify(require("xml2js").parseString);
const {
  GraphQLInt,
  GraphQLString,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLList
} = require("graphql");

const BookType = new GraphQLObjectType({
  name: "Book",
  description: "...",

  fields: () => ({
    title: {
      type: GraphQLString,
      resolve: xml => {
        console.log(xml.GoodreadsResponse.book[0]);
        xml.GoodreadsResponse.book[0].title[0];
      }
    },
    isbn: {
      type: GraphQLString,
      resolve: xml => xml.GoodreadsResponse.book[0].isbn[0]
    }
  })
});

const AuthorType = new GraphQLObjectType({
  name: "Author",
  description: "...",

  fields: () => ({
    name: {
      type: GraphQLString,
      resolve: xml => xml.GoodreadsResponse.author[0].name[0]
    },
    books: {
      type: new GraphQLList(BookType),
      resolve: xml => {
        // console.log(xml.GoodreadsResponse.author[0].books[0].book);
        const ids = xml.GoodreadsResponse.author[0].books[0].book.map(
          elem => elem.id[0]._
        );
        // console.log(ids);
        console.log("fetching bookkks!");
        return Promise.all(
          ids.map(id =>
            fetch(
              `https://www.goodreads.com/book/show/${id}.xml?key=WrPwyxBPMtPbEX5zMkThWQ`
            )
              .then(response => response.text())
              .then(parseXML)
          )
        );
      }
    }
  })
});

// const AuthorType = new GraphQLObjectType({
//   name: "Author",
//   description: "...",

//   fields: () => ({
//     name: {
//       type: GraphQLString,
//       resolve: xml => xml.GoodreadsResponse.author[0].name[0]
//     },
//     books: {
//       type: new GraphQLList(BookType),
//       resolve: xml =>
//         xml.GoodreadsResponse.author[0].books[0].book.map(book => ({
//           title: book.title[0],
//           isbn: book.isbn[0]
//         }))
//     }
//   })
// });

module.exports = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    description: "...",
    fields: () => ({
      author: {
        type: AuthorType,
        args: {
          id: {
            type: GraphQLInt
          }
        },
        resolve: (parentValue, args) => {
          let key = `WrPwyxBPMtPbEX5zMkThWQ`;
          let url = `https://www.goodreads.com/author/show.xml?id=${args.id}&key=${key}`;
          let result = fetch(url);
          return result.then(res => res.text()).then(parseXML);
        }
      }
    })
  })
});

// {
//   user(id: 10596512) {
//     name
//     image
//     lastActive
//     friendsNo
//     reviewsCount
//     userShelves {
//       read
//       currentlyReading
//       toRead
//     }
//     userStatus

//   }
// }
