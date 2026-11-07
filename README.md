# Free Intelligence Lab — local starter (v0.1)

ეს არის **რეალურად გასაშვები, ლოკალური საწყისი პროექტი**: ერთი პორტალი + OSIRIS + FreeLLMAPI + Ollama + Open WebUI; სურვილისამებრ SearXNG და Qdrant. Ruflo-სთვის ცალკე initializer-ია. ის არ არის OSIRIS-ის, FreeLLMAPI-ისა და Ruflo-ს სრული კოდური გაერთიანება, არამედ მათი ლოკალური გაშვების და მართვის საწყისი გარემო.

## 1. მოთხოვნები

- Linux, macOS ან Windows (WSL2/Docker Desktop)
- Docker Engine + Docker Compose v2
- OpenSSL; Ruflo-სთვის დამატებით Node.js 20+ და npm/npx
- ინტერნეტი პირველი კონტეინერებისა და ლოკალური AI მოდელის ჩამოსატვირთად
- რეკომენდებული მინიმუმ 8GB RAM და თავისუფალი დისკი (რამდენიმე კონტეინერი); AI-სთვის მეტი RAM უკეთესია. მცირე მოდელით CPU-ზეც შეიძლება მუშაობა, მაგრამ ნელა.

## 2. დაწყება (Linux/macOS)

```bash
unzip free-intelligence-lab.zip
cd free-intelligence-lab
./scripts/start.sh
```

სკრიპტი ქმნის `.env` ფაილს და **შემთხვევით საიდუმლო გასაღებებს**. `.env` არ გააზიარო და არ ატვირთო GitHub-ში. თუ Docker-ის წვდომა `sudo`-ს ითხოვს, მოაგვარე Docker-ის უფლებები სისტემის დოკუმენტაციით, არ გახადო კონტეინერები საჯარო.

გახსენი: **http://localhost:8088**

| ლოკალური მისამართი | ფუნქცია |
|---|---|
| http://localhost:8088 | საკუთარი საკონტროლო პორტალი |
| http://localhost:3000 | OSIRIS |
| http://localhost:3001 | FreeLLMAPI |
| http://localhost:3002 | Open WebUI |
| http://localhost:11434/api/tags | Ollama API |

პირველ გაშვებაზე სერვისების გამოსახულებებს დრო სჭირდება ჩამოტვირთვისა და პირველადი კონფიგურაციისთვის. FreeLLMAPI-სა და Open WebUI-ში შექმენი საკუთარი ლოკალური ადმინისტრატორის ანგარიში.

## 3. უფასო, ლოკალური AI მოდელი

```bash
docker compose exec ollama ollama pull qwen2.5:1.5b
```

ამის შემდეგ მოდელი გამოჩნდება პორტალის AI ჩატში და Open WebUI-ში. ეს არის შედარებით მცირე მოდელი, ამიტომ სერიოზულ დავალებებში ძლიერი ფასიანი მოდელების შესაძლებლობებს ვერ გაუტოლდება. მოდელის გამოძახება ხორციელდება ადგილობრივ `ollama` კონტეინერში.

## 4. FreeLLMAPI — უფასო პროვაიდერები

გახსენი http://localhost:3001, დაასრულე პირველადი დაყენება და Keys-ში დაამატე **შენი კანონიერად მიღებული** უფასო პროვაიდერის გასაღებები. FreeLLMAPI არ გაძლევს უფასო უსასრულო ლიმიტებს; ის შენს მიერ დამატებულ provider-ებს შორის ანაწილებს მოთხოვნებს. ყველა პროვაიდერის საკუთარი პირობები და ლიმიტები ძალაში რჩება. საჯარო ან კომერციული გამოყენებისთვის ავტორის გაფრთხილებები გაითვალისწინე.

Open WebUI-დან მის გამოყენებას სჭირდება ადმინისტრატორის Settings → Connections განყოფილებაში OpenAI-compatible კავშირის დამატება:

- Base URL: `http://freellmapi:3001/v1` (Docker-ის საერთო ქსელიდან)
- API key: შენი *unified* `freellmapi-...` key, რომელიც ჩანს FreeLLMAPI-ის ინტერფეისში

Open WebUI-ის მოდელების ჩამონათვალში სიახლეების ასახვის შემდეგ აირჩიე მისაწვდომი მოდელი. API გასაღები არასოდეს ჩასვა პორტალის HTML/JS ფაილში.

## 5. Ruflo — agent orchestration

Ruflo — AI აგენტების კოორდინაციის გარემოა, არა უფასო AI მოდელების პროვაიდერი. მისი სრულფასოვანი მუშაობისთვის ჯერ კიდევ საჭიროა თავსებადი AI კლიენტი და სწორად დაკავშირებული LLM მოდელი.

შენს კომპიუტერზე Node.js/npm-ის დაყენების შემდეგ:

```bash
./scripts/ruflo-init.sh
```

ოფიციალური Ruflo initializer იმუშავებს `agent-workspace` საქაღალდეში. MCP კლიენტისთვის ავტორის მაგალითია `npx -y ruflo@latest mcp start`. მოდელის დაკავშირება ცალკე უნდა დააკონფიგურო. მხოლოდ ამ ბრძანებით Ruflo და FreeLLMAPI ერთმანეთთან ავტომატურად არ ერთიანდება.

## 6. არჩევითი მოდულები

```bash
docker compose --profile search --profile memory up -d
```

- SearXNG: http://localhost:8082 — ცალკე მეტაძიების სისტემა. საძიებო შედეგების ხარისხი და საიტების ხელმისაწვდომობა ცვალებადია.
- Qdrant: http://localhost:6333/dashboard — ვექტორული ბაზა. დოკუმენტების/RAG ინდექსირება ავტომატურად არ არის გამართული; ბაზა მზადაა შემდგომი ინტეგრაციისთვის.

### მართვა

```bash
docker compose ps
docker compose logs -f freellmapi
docker compose pull
docker compose up -d
docker compose down
```

`docker compose down` ჩვეულებრივ ინარჩუნებს named volumes-ს. `down -v` კი **წაშლის მონაცემებს**, მათ შორის ანგარიშებსა და გადმოწერილ მოდელებს — ნუ გაუშვებ მათი შენარჩუნების საჭიროებისას.

## 7. უსაფრთხოება და შეზღუდვები

- **პორტები განზრახ მიბმულია `127.0.0.1`-ზე.** არ განათავსო FreeLLMAPI, Ollama, Qdrant ან სხვა შიდა API საჯარო ინტერნეტში ავთენტიკაციისა და უსაფრთხოების მიმოხილვის გარეშე.
- OSIRIS-ის საჯარო მონაცემების ყველა წყარო ყოველთვის არ მუშაობს; ზოგჯერ API გასაღები ან ლიმიტების გათვალისწინება არის საჭირო. დამატებითი სკანერის სერვისი ამ საწყის პაკეტში არ შედის.
- პორტალი უკვე მუშაობს როგორც dashboard და ლოკალური AI ჩატი; არ შეიცავს სრულად აწყობილ OSINT→AI→agent პროცესებს. ამ ფუნქციისთვის საჭიროა სპეციალური ინტეგრაცია.
- თვითონ პროგრამული უზრუნველყოფისთვის აუცილებელი ფასიანი გამოწერა **არ არის**. მაგრამ ელექტროენერგია, მოწყობილობა, ინტერნეტი და სურვილისამებრ VPS/დომენი შესაძლოა თანხას მოითხოვდეს.
- ეს პაკეტი აქ დამზადდა და მისი YAML/პორტალი შემოწმდა ადგილობრივად; Docker image pull/run და ინტერნეტ API-ების ხელმისაწვდომობა ამ გარემოში ბოლომდე ვერ გაიტესტა.

### პროექტები და წყაროები

- [OSIRIS](https://github.com/simplifaisoul/osiris) — MIT
- [FreeLLMAPI](https://github.com/tashfeenahmed/freellmapi) — MIT; author restricts recommended usage to personal experimentation
- [Ruflo](https://github.com/ruvnet/ruflo) — MIT
- [Ollama](https://github.com/ollama/ollama)
- [Open WebUI](https://github.com/open-webui/open-webui) — obey its current license/branding conditions
- [SearXNG](https://github.com/searxng/searxng)
- [Qdrant](https://github.com/qdrant/qdrant)