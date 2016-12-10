desc 'run jekyll server'

task :dev do
  system 'bundle exec jekyll serve --drafts'
end

task :build do
  system 'rm -rf .asset-cache _site'
  system 'JEKYLL_ENV=production bundle exec jekyll build'
end