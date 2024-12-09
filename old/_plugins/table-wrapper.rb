require 'nokogiri';

module Jekyll
  class TableWrapper
    def self.process(document)
      # Early return if no tables are present.
      if document.output.index(/<table\b/).nil?
        return
      end

      wrapper_tag = 'div';
      wrapper_css_class = 'table-wrapper';
      wrapper = "<#{wrapper_tag} class=\"#{wrapper_css_class}\"></#{wrapper_tag}>"

      xpath_selector = '//body//table'
      xpath_selector << "[not(parent::#{wrapper_tag}[contains(concat(' ', normalize-space(@class), ' '), ' #{wrapper_css_class} ')])]"
      # Exclude tables added to syntax highlighted code blocks.
      xpath_selector << '[not(ancestor::pre)][not(ancestor::code)]'

      parsed_document = Nokogiri::HTML(document.output)
      parsed_document.search(xpath_selector).each do |table_node|
        table_node.wrap(wrapper)
      end

      document.output = parsed_document.to_html
    end
  end
end

Jekyll::Hooks.register [:pages, :documents], :post_render do |document|
  Jekyll::TableWrapper.process(document) if document.write? and document.output_ext == '.html'
end
