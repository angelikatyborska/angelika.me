desc 'run jekyll server'

task :dev do
  system 'bundle exec jekyll serve --host 0.0.0.0 --drafts'
end

task :build do
  system 'rm -rf .jekyll-cache _site'
  system 'JEKYLL_ENV=production bundle exec jekyll build'
end
