---
title: 7 Gettext lessons learned after 2 years of developing a European platform
excerpt: In January 2020, we grew Steady's language support from 2 to 9 languages. Those initial efforts, as well as adding new features to the platform afterwards, taught us a few good practices for working with Gettext. 
tags: [Elixir, Gettext, i18n]
date: 2021-11-23 21:01:00 +0100
---

In January 2020, we were finishing an ambitious task at [Steady](https://steadyhq.com/) - grow our platform from 2 languages, translated in-house, to many more, translated externally, with the ability to add new ones fast.

It's November 2021, and currently Steady is available in 9 different languages: German, Greek, English, Spanish, French, Hungarian, Italian, Portuguese, and Romanian.

Here are 7 lessons that we learned by completing the initial translation efforts and continuing to add new features to the platform for 2 years.

## Background / disclaimer

English and German are Steady's main languages that get translated in-house. All the other languages are translated by an external agency via the platform [Crowdin](https://crowdin.com/), which provides plenty of excellent features that Steady relies on to make the translators' work easier. Some of the advice here might not apply to you if you use a different tool that doesn't offer features like attaching screenshots to translations and HTML syntax highlighting in translations.

While some of the languages here differ a lot from one another (e.g. Greek vs Hungarian), they are all still relatively similar European languages. Some of the lessons learned here might not apply to you if you need to support a wider variety of languages.

## 1. Use your English texts as `msgid`s

```
## DO ✅
msgid "Your daily report from Steady for %{publication_title}"
msgstr "Dein täglicher Steady-Report für %{publication_title}"

## DO NOT ⛔️
msgid "publisher.daily_publication_email.subject %{publication_title}"
msgstr "Dein täglicher Steady-Report für %{publication_title}"
```

Benefits:

- The old translations automatically get removed when the original changes, which 95% of the time is what you want.
- It's easier to recognize if the translation doesn't follow certain patterns that the original follows (e.g. is this a full sentence, capitalized, and with a dot at the end?).
- If you ever forget to add translations, the worst-case scenario is that somebody will get an English sentence in a middle of a Greek page, not `computer_friendly.but_human_unfriendly_gibberish`.
- No need to keep coming up with arbitrary keys.

## 2. Provide extra context for short strings

```
## DO ✅
msgctxt "verb"
msgid "Comment"
msgstr "Kommentieren"

msgctxt "noun, singular"
msgid "Comment"
msgstr "Kommentar"

## DO NOT ⛔️
msgid "Comment"
msgstr "???"
```

A single word can have many different meanings. The shorter the phrase, the higher the chance it can mean two different things. Let's see a few more examples:

- "Reply" - a noun or a verb?
- "State" - a condition or a political unit that makes up a federal union (e.g. Bavaria in Germany)?
- "That text is bold" - having written that text required courage, or was the text written in bold letters?
- "New" - what exactly is new? In some languages, an adjective cannot exist without a grammatical gender, which is dictated by the noun the adjective describes.

When adding a short string, always stop to think: is it clear what this string means on its own, or does it need extra context? If it needs extra context, use the [`pgettext` macro](https://hexdocs.pm/gettext/Gettext.html#pgettext/4) to add it.

Another excellent option for providing more context is uploading UI screenshots to the translation platform.

## 3. Never break a single sentence into multiple strings

```
## DO ✅
msgid "<strong>Create plans</strong> that potential members can buy."
msgstr "<strong>Lege Pakete an</strong>, die potenzielle Mitglieder kaufen können."

## DO NOT ⛔️
msgid "Create plans"
msgstr "Lege Pakete an"

msgid "that potential members can buy."
msgstr ", den/die/das/die (???) potenzielle Mitglieder kaufen können."
```

It should be possible to translate a single string correctly without having to look around the project to check if it belongs together with some other string. There is no syntax in Gettext that would even allow expressing this kind of relationship between two strings.

You might be tempted to do this to avoid putting HTML in your string, but splitting a sentence into two independent parts is a recipe for a grammatical disaster. Most languages have [inflection](https://en.wikipedia.org/wiki/Inflection) much more advanced than English does. Words change slightly depending on their grammatical context - tense, case, person, number, gender and so on. This makes it impossible to just "insert" a word in a sentence and have it make sense without any modifications.

In the example, note how extracting the phrase "create plans" from the sentence makes it impossible to correctly translate the word "that". To translate it correctly, we need to know that it refers to the plural word "plans".

## 4. Putting simple HTML in your strings is fine

It is sometimes necessary to put HTML in your strings to let a sentence be translated as a whole. Modern translation tools can handle it. A translation platform can do syntax highlighting for HTML tags and even warn translators from submitting translations with missing tags, and a machine translation service like DeepL can return HTML tags unchanged.

<figure>
<a href='{% asset posts/7-gettext-lessons-after-2-years/crowdin-translator-ui @path %}'>
{% asset posts/7-gettext-lessons-after-2-years/crowdin-translator-ui alt:'A screenshot of the translator UI offered by Crowdin'%}
</a>
<figcaption>On <a href="https://crowdin.com/">Crowdin</a>, HTML tags in original strings are highlighted, and translators are warned before saving a translation with missing tags.</figcaption>
</figure>

If you want to be extra sure the external translations are safe, check out this [gist with a unit test that ensures all translations use the same HTML tags as the original](https://gist.github.com/angelikatyborska/fadbde5c3d4f2db25a58a4519d3b94ac).

## 5. Extract into variables what doesn't need translating

```
## DO ✅
msgid "Please write to %{support_email} and we will solve this issue."
msgstr "Bitte schreib uns an %{support_email}, dann lösen wir das."

## DO NOT ⛔️
msgid "Please write to support@steadyhq.com and we will solve this issue."
msgstr "Bitte schreib uns an support@steadyhq.com, dann lösen wir das."
```

If you know a value has to be always the same between languages, like an email address or a URL, do not put it in the string. Use a variable instead. This will remove the possibility of a translator accidentally changing it when they were not supposed to. The same applies for values that have to differ between languages but are not up to the translators, e.g. if you provide a different support email address depending on the user's language.

To make it more convenient to follow this rule at Steady, we created [a special macro `dgettext_with_link` for embedding links as variables](https://gist.github.com/angelikatyborska/cebc3de03c08307edebf6054ed09ff5f), while still giving the whole sentence to the translators. When used, it looks like this:

```elixir
dgettext_with_link(
  "emails",
  "%{link_start}Become a member%{link_end} for continued access.",
  link: @campaign_page_url
)
```

## 6. Always use `ngettext` when dealing with a variable count

```elixir
# DO ✅
if count > 1 do
  ngettext(
    "%{count} month ago",
    "%{count} months ago",
    count,
    %{count: count}
  )
end

# DO NOT ⛔️
if count > 1 do
  gettext(
    "%{count} months ago",
    %{count: count}
  )
end
```

English and German might have only two plural forms, _"one"_ when `n = 1` and _"other"_ when `n != 1`, but other languages can have 3 or even 4. Take a look at this beautiful [gigantic table with pluralization rules for various languages](https://www.unicode.org/cldr/cldr-aux/charts/34/supplemental/language_plural_rules.html). For example, Polish has 3 plural forms - _"one"_, _"few"_, and _"many"_. In Polish, "4 months ago" is "4 miesią**ce** temu", but "5 months ago" is "5 miesię**cy** temu".

Always let Gettext deal with pluralization. It knows how to do it correctly. Well, as long as there is only one pluralized noun in the sentence - if there's more... you might need to ditch Gettext in favor of something more powerful, like the ICU message format.

## 7. Optimize your Gettext configuration for faster compilation

If you're suffering from slow recompilation times and your project already has multiple languages, [check out my blog post "Speed up the compilation of Elixir projects that use Gettext"](https://angelika.me/2020/09/02/speed-up-the-compilation-of-elixir-projects-that-use-gettext/).

## Bonus lesson: hire a diverse team

A diverse team has a lot of strengths, and one of them can be speaking many different languages. People that know more than one language will have an easier time empathizing with translators and foreseeing problems that translators might face when translating short and vague English phrases.

_Edited on 08.12.2021: removed flag emojis._
