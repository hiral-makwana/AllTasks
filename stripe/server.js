require ( 'dotenv' ).config( )
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY
const express = require('express')
const app = express()
const fs = require('fs')
const stripe = require('stripe')(stripeSecretKey)


app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.static('public'))

const PORT = 3000
app.listen ( PORT , ( ) =>{
 console.log( `app running on port ${PORT}`)   
})
app.get('/store', (req, res) => {
    fs.readFile('items.json', (error, data) => {
      if (error) {
        res.status(500).end()
      } else {
        res.render('store.ejs', {
          stripePublicKey: stripePublicKey,
          items: JSON.parse(data)
        })
      }
    })
  })
 

app.post('/purchase', function(req, res) {
    fs.readFile('items.json', function(error, data) {
      if (error) {
        res.status(500).end()
        console.log("purchase fail")
      } else {
        const itemsJson = JSON.parse(data)
        const itemsArray = itemsJson.music.concat(itemsJson.merch)
        let total = 0
        req.body.items.forEach(function(item) {
          const itemJson = itemsArray.find(function(i) {
            return i.id == item.id
          })
          total = total + itemJson.price * item.quantity
        })
        const paymentIntent = stripe.paymentIntents.create({
            amount: total,
            source: req.body.stripeTokenId,
            currency: 'inr',
        
            }).then(function(){
              //console.log(paymentIntent)
          console.log('Charge Successful')
          res.json({ message: 'Successfully purchased items' })
        }).catch(function() {
         
          console.log('Charge Fail')
          res.status(500).end()
        })
      }
      
    })
  })