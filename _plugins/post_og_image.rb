require 'fileutils'
# require 'pry'

# The whole purpose of this plugin is to copy over post md files into og_images

module Filter
  def self.process(site, payload)
    site.collections['posts'].docs.select{|x| x.data['draft'] == false}.each do |post|

      # Set the path where the copied content will live
      path = './_og_images/' + post.data['slug'] + '.md'

      # Copy the content of the post to the preview collection
      File.write(path, File.read(post.path))

      # Create a new document in the preview collection
      preview_doc = Jekyll::Document.new(
        path,
        {site: site, collection: site.collections['og_images']}
      )

      preview_doc.read

      # Set the layout to preview
      preview_doc.data['layout'] = 'post_og_image'

      # Add document to the collection
      site.collections['og_images'].docs << preview_doc

    end
  end
end

Jekyll::Hooks.register :site, :post_read do |site, payload|
  # If the site is being served locally
  # skip generating og_images
  # Otherwise there'll be an endless loop of og_images being
  # written and regenerated

  # comment out the 'if' when developing the styles in dev

  if !site.config['serving']
    Filter.process(site, payload)
  end
end
