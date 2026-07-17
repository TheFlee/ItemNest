$base = "http://localhost:8080"

# Login
$loginBody = @{ email = "admin@local.dev"; password = "Admin@123456" } | ConvertTo-Json
$loginRes = Invoke-RestMethod -Uri "$base/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginRes.token
$headers = @{ Authorization = "Bearer $token" }
Write-Host "Logged in." -ForegroundColor Green

$posts = @(
  @{
    title = "Lost black leather wallet near Nizami metro"
    description = "Lost my black leather bifold wallet near Nizami metro station on the evening of July 14th. Contains my ID card, bank cards, and about 40 AZN cash. The wallet has a small worn patch on the bottom left corner and a receipt from Bravo supermarket tucked inside. Very important documents inside, please contact if found."
    type = 0; color = 1; location = "Nizami metro station, Baku"; categoryId = 1
    eventDate = "2026-07-14T18:30:00Z"
  },
  @{
    title = "Found iPhone 14 Pro on 28 May street"
    description = "Found an iPhone 14 Pro (space black, cracked screen protector) on the sidewalk near the Azerbaijani Drama Theatre on 28 May street. The phone has a passcode so I cannot check whose it is. It was found at approximately 2pm on July 15th. Keeping it safe - the owner can describe the phone case and wallpaper to claim it."
    type = 1; color = 1; location = "28 May Street, Baku"; categoryId = 2
    eventDate = "2026-07-15T14:00:00Z"
  },
  @{
    title = "Lost car keys with Toyota fob and red keychain"
    description = "Lost a set of car keys somewhere between Sahil Garden and Caspian Plaza on July 13th afternoon. The keyring has a Toyota remote fob, a small apartment key, and a distinctive red enamel flame keychain bought in Istanbul. Without these keys I cannot drive my car. Please call or message if found."
    type = 0; color = 5; location = "Sahil Garden, Baku"; categoryId = 3
    eventDate = "2026-07-13T15:45:00Z"
  },
  @{
    title = "Found brown leather handbag in Ganjlik Mall"
    description = "Found a medium-sized brown leather handbag on a bench near the food court on the third floor of Ganjlik Mall on July 16th around 6pm. The bag contains personal items. Handed it to mall security - please contact the Ganjlik Mall security desk with a description to retrieve it."
    type = 1; color = 8; location = "Ganjlik Mall, Baku"; categoryId = 4
    eventDate = "2026-07-16T18:00:00Z"
  },
  @{
    title = "Lost university diploma and passport copies"
    description = "Lost a yellow envelope containing my original university diploma (ADA University, 2023) and notarized copies of my passport. Left it on the 5 or 6 bus going toward Hazi Aslanov station on the morning of July 12th. Needed urgently for a job application. Any information greatly appreciated."
    type = 0; color = 7; location = "Bus route 5/6, Hazi Aslanov direction, Baku"; categoryId = 5
    eventDate = "2026-07-12T09:00:00Z"
  },
  @{
    title = "Found silver Apple Watch Series 8 in Flame Towers park"
    description = "Found a silver Apple Watch Series 8 with a white sport band on the grass in the park area near Flame Towers on July 16th evening. The watch screen is intact and it still has battery. The watch face shows a photo of two people. I will keep it charged and safe until the owner contacts me."
    type = 1; color = 12; location = "Flame Towers Park, Baku"; categoryId = 6
    eventDate = "2026-07-16T20:15:00Z"
  },
  @{
    title = "Lost gold ring with small emerald stone"
    description = "Lost a gold ring with a small emerald stone set in the center. It is a family heirloom given by my grandmother and has immense sentimental value. Noticed it missing after visiting Taza Bazaar on July 11th morning. The ring has a small hallmark inscription on the inside band. Will offer a reward for its return."
    type = 0; color = 13; location = "Taza Bazaar, Baku"; categoryId = 7
    eventDate = "2026-07-11T10:30:00Z"
  },
  @{
    title = "Lost blue Samsung Galaxy S23 in taxi"
    description = "Left my blue Samsung Galaxy S23 in an Uber taxi on the night of July 15th, travelling from Bayil to Narimanov district. The phone is in a clear transparent case with a small sticker of mountains on the back. Tried calling but it goes straight to voicemail. The ride ended around 11:30pm."
    type = 0; color = 4; location = "Bayil to Narimanov district, Baku"; categoryId = 2
    eventDate = "2026-07-15T23:30:00Z"
  },
  @{
    title = "Found set of apartment keys near Fountains Square"
    description = "Found a keyring with three apartment keys and a building intercom fob near the central fountain at Fountains Square on the evening of July 14th. The keyring has a small leather tag with the letter A engraved on it. If these are your keys, please describe the tag or fob to confirm ownership."
    type = 1; color = 12; location = "Fountains Square, Baku"; categoryId = 3
    eventDate = "2026-07-14T19:45:00Z"
  },
  @{
    title = "Lost gray North Face backpack on metro"
    description = "Lost a large gray North Face Recon backpack on the Icheri Sheher to 20 January metro line on July 13th during morning rush hour around 8:30am. The bag contains a MacBook Pro 14 inch, charger, blue water bottle, gym clothes, and my ADA student ID. There is a small patch of duct tape on the left shoulder strap."
    type = 0; color = 3; location = "Baku Metro, Icheri Sheher line"; categoryId = 4
    eventDate = "2026-07-13T08:30:00Z"
  },
  @{
    title = "Found white AirPods Pro case near Baku Mall"
    description = "Found a white AirPods Pro charging case (second generation) in the parking lot outside Baku Mall on July 12th afternoon. The case has a small dent on one corner. The AirPods are inside. The owner can verify by opening the case near their iPhone to trigger the pairing popup, which will show the device name."
    type = 1; color = 2; location = "Baku Mall parking lot, Baku"; categoryId = 8
    eventDate = "2026-07-12T14:00:00Z"
  },
  @{
    title = "Lost red women's wallet on boulevard"
    description = "Lost a small red zip-around wallet on the seafront boulevard between the carpet museum and Crystal Hall on the afternoon of July 10th. Bright red faux leather with a gold zipper. Inside are two bank cards, health insurance card, bus pass, and approximately 20 AZN. The wallet also has a small photo of my dog inside."
    type = 0; color = 5; location = "Baku Boulevard, near Carpet Museum"; categoryId = 1
    eventDate = "2026-07-10T16:00:00Z"
  },
  @{
    title = "Found prescription glasses in Sahil metro"
    description = "Found a pair of eyeglasses on a bench on the platform of Sahil metro station on July 16th morning. Black rectangular frames with thin metal arms. Prescription lenses with moderate strength. Found in a small blue soft case. Currently held with Sahil station staff or contact me directly."
    type = 1; color = 1; location = "Sahil Metro Station, Baku"; categoryId = 8
    eventDate = "2026-07-16T08:45:00Z"
  },
  @{
    title = "Lost silver Casio watch near Heydar Aliyev Center"
    description = "Lost a silver Casio Edifice watch with a metal bracelet band during the outdoor exhibition at Heydar Aliyev Center on July 8th. The watch has a black dial with silver subdials and a small scratch on the bezel at the 3 o'clock position. It was a gift from my father. A reward is offered for its safe return."
    type = 0; color = 12; location = "Heydar Aliyev Center, Baku"; categoryId = 6
    eventDate = "2026-07-08T11:00:00Z"
  },
  @{
    title = "Found gold women's earrings near Martyrs Lane"
    description = "Found a pair of gold hoop earrings (approximately 3cm diameter) on the path near the upper entrance of Martyrs Lane on July 10th evening. They appear to be real gold - fairly heavy and well made. Found near one of the benches overlooking the Caspian. The owner should describe size and design details to claim."
    type = 1; color = 13; location = "Martyrs Lane, Baku"; categoryId = 7
    eventDate = "2026-07-10T20:00:00Z"
  },
  @{
    title = "Lost purple phone case with family photos"
    description = "Lost a purple silicone iPhone 13 case that had two small printed photos tucked inside the clear inner pocket - one family photo and one graduation photo. Dropped it somewhere between the Icherisheher Old City gate and the Maiden Tower on July 9th during a walking tour. The case has a small crack on the top right corner."
    type = 0; color = 10; location = "Icherisheher Old City, Baku"; categoryId = 8
    eventDate = "2026-07-09T12:30:00Z"
  },
  @{
    title = "Found men's brown leather Oxford shoes"
    description = "Found a pair of men's brown leather Oxford shoes (size 43 EU) left outside the changing rooms at Sahil Garden. Good quality shoes, polished, appear to have been left by accident. Found on July 15th in the afternoon near the main changing room entrance. Describe the brand and insole detail to claim."
    type = 1; color = 8; location = "Sahil Garden, Baku"; categoryId = 8
    eventDate = "2026-07-15T15:30:00Z"
  },
  @{
    title = "Found green canvas tote bag in cafe"
    description = "Found a green canvas tote bag left behind at Baku Coffee House on Rasul Rza Street on July 17th morning. The bag contains art supplies - sketchbooks, pencils, and markers - along with a gray hoodie. Left it with the cafe staff at the counter. Please come in and describe the contents to collect it."
    type = 1; color = 6; location = "Baku Coffee House, Rasul Rza Street, Baku"; categoryId = 4
    eventDate = "2026-07-17T09:30:00Z"
  },
  @{
    title = "Lost orange Patagonia jacket near Koala Park"
    description = "Lost a bright orange Patagonia Nano Puff jacket at the playground area near Koala Park in Narimanov district on July 7th. My name is written on the label inside the collar in black marker. The jacket has two zip pockets and is very recognizable due to the bright orange colour. My daughter left it on a bench while playing."
    type = 0; color = 11; location = "Koala Park, Narimanov, Baku"; categoryId = 8
    eventDate = "2026-07-07T17:00:00Z"
  },
  @{
    title = "Found passport in Baku International Airport"
    description = "Found a passport at the departures check-in area of Heydar Aliyev International Airport on July 16th. The owner was clearly rushing to catch a flight. Handed the passport to airport lost and found at Terminal 1. If this is yours, go to the airport lost and found desk with proof of identity."
    type = 1; color = 3; location = "Heydar Aliyev International Airport, Baku"; categoryId = 5
    eventDate = "2026-07-16T07:15:00Z"
  },
  @{
    title = "Lost yellow children's backpack in Nariman park"
    description = "My son lost his small yellow Lego Ninjago children's backpack at the playground in Nariman park on July 6th afternoon. The bag has a Ninjago character on the front and contains his Nintendo Switch, a pencil case, and a water bottle with dinosaur stickers. He is very upset about losing it."
    type = 0; color = 7; location = "Nariman Park, Baku"; categoryId = 4
    eventDate = "2026-07-06T16:30:00Z"
  },
  @{
    title = "Found black men's wallet with multiple bank cards"
    description = "Found a black leather wallet on the floor inside Bravo supermarket on Tbilisi Avenue on July 17th. The wallet contains several bank cards and what appears to be a company access card. No cash but many cards the owner will need urgently. Currently in my possession - please describe your cards to verify ownership."
    type = 1; color = 1; location = "Bravo Supermarket, Tbilisi Avenue, Baku"; categoryId = 1
    eventDate = "2026-07-17T11:00:00Z"
  },
  @{
    title = "Lost pink women's umbrella at State Philharmonic"
    description = "Left a pink floral-patterned umbrella at the coat check of the Azerbaijan State Philharmonic Hall after the concert on July 5th evening. Compact fold-up style with a pink floral print and white handle. If the coat check staff or another concert-goer found it, please contact me. It is the only umbrella I own."
    type = 0; color = 9; location = "Azerbaijan State Philharmonic Hall, Baku"; categoryId = 8
    eventDate = "2026-07-05T22:00:00Z"
  },
  @{
    title = "Found blue gym bag near Baku Olympic Stadium"
    description = "Found a large blue Adidas gym bag near the entrance gates of Baku Olympic Stadium after the match on July 10th. The bag contains sports clothing, cleats, shin guards, and a water bottle. The cleats inside are size 41. Left near Gate C. Please contact and describe the exact contents to confirm ownership."
    type = 1; color = 4; location = "Baku Olympic Stadium, Gate C"; categoryId = 4
    eventDate = "2026-07-10T22:30:00Z"
  },
  @{
    title = "Lost black men's leather belt near Port Baku gym"
    description = "Lost a classic black leather dress belt with a rectangular silver buckle at the Port Baku Residences gym changing room on July 11th. The belt is size 90cm and has a small B branded into the leather near the buckle. May have left it hanging on a hook in the men's locker room."
    type = 0; color = 1; location = "Port Baku Residences, Baku"; categoryId = 8
    eventDate = "2026-07-11T19:00:00Z"
  }
)

$successCount = 0
$failCount = 0

foreach ($post in $posts) {
  $body = @{
    title       = $post.title
    description = $post.description
    type        = $post.type
    color       = $post.color
    location    = $post.location
    categoryId  = $post.categoryId
    eventDate   = $post.eventDate
  } | ConvertTo-Json -Depth 3

  try {
    $res = Invoke-RestMethod -Uri "$base/api/itemposts" -Method POST -Body $body -ContentType "application/json; charset=utf-8" -Headers $headers
    $successCount++
    Write-Host "[$successCount] $($post.title)" -ForegroundColor Cyan
  } catch {
    $failCount++
    Write-Host "FAILED: $($post.title)" -ForegroundColor Red
    Write-Host "  $_" -ForegroundColor Yellow
  }
}

Write-Host ""
Write-Host "Done. Created: $successCount  Failed: $failCount" -ForegroundColor Green
